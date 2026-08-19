import supabase from "./supabase";

const BUCKET = "product-images";

export async function getProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*, product_variants(*)")
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    console.error(error);
    throw new Error("Products could not be loaded");
  }

  return data.map((product) => ({
    ...product,
    variants: (product.product_variants || []).sort(
      (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.id - b.id
    ),
  }));
}

function safeFileName(file) {
  return `${Date.now()}-${Math.random()}-${file.name}`
    .replaceAll("/", "")
    .replace(/[^a-zA-Z0-9._-]/g, "-");
}

async function uploadOne(file) {
  const name = safeFileName(file);
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(name, file, { contentType: file.type || "image/jpeg" });
  if (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }
  return {
    name,
    url: supabase.storage.from(BUCKET).getPublicUrl(name).data.publicUrl,
  };
}

export async function createEditProduct(newProduct, id) {
  // --- Cover image ---
  const image = newProduct.image;
  const hasNewImage = image instanceof File;

  if (!image) throw new Error("Please select a cover image");

  let coverUploadName = null;
  let imagePath = image;
  if (hasNewImage) {
    const { name, url } = await uploadOne(image);
    coverUploadName = name;
    imagePath = url;
  }

  // --- Gallery uploads ---
  const galleryFiles = Array.isArray(newProduct.gallery_files)
    ? newProduct.gallery_files
    : [];
  const existingGalleryUrls = Array.isArray(newProduct.gallery_images)
    ? newProduct.gallery_images
    : [];
  const uploadedGallery = [];
  const uploadedNames = [];
  try {
    for (const file of galleryFiles) {
      const { name, url } = await uploadOne(file);
      uploadedNames.push(name);
      uploadedGallery.push(url);
    }
  } catch (err) {
    // Rollback any successful uploads from this call
    if (coverUploadName) {
      await supabase.storage.from(BUCKET).remove([coverUploadName]);
    }
    if (uploadedNames.length > 0) {
      await supabase.storage.from(BUCKET).remove(uploadedNames);
    }
    throw err;
  }

  // --- Build payload ---
  const isBlank = (v) => v === "" || v === null || v === undefined;

  const productPayload = {
    name: newProduct.name,
    subtitle: newProduct.subtitle || null,
    description: newProduct.description || "",
    temperature: newProduct.temperature || "normal",
    sort_order: Number(newProduct.sort_order) || 0,
    image: imagePath,
    gallery_images: [...existingGalleryUrls, ...uploadedGallery],
    features: Array.isArray(newProduct.features) ? newProduct.features : [],
    notes: Array.isArray(newProduct.notes) ? newProduct.notes : [],
    spec_content: newProduct.spec_content || null,
    spec_origin: newProduct.spec_origin || null,
    spec_ingredients: newProduct.spec_ingredients || null,
    spec_shelf_life: newProduct.spec_shelf_life || null,
    spec_storage: newProduct.spec_storage || null,
  };

  // --- DB write ---
  let query = supabase.from("products");
  if (!id) query = query.insert([productPayload]);
  else query = query.update(productPayload).eq("id", id);

  const { data, error } = await query.select().single();

  if (error) {
    // Rollback uploads on failure
    const toRemove = [];
    if (coverUploadName) toRemove.push(coverUploadName);
    toRemove.push(...uploadedNames);
    if (toRemove.length > 0) {
      await supabase.storage.from(BUCKET).remove(toRemove);
    }
    console.error(error);
    throw new Error(`Product could not be saved: ${error.message}`);
  }

  // --- 規格（價格與庫存所在層）---
  const variants = Array.isArray(newProduct.variants) ? newProduct.variants : [];
  if (variants.length === 0) {
    throw new Error("請至少設定一組規格");
  }

  const keepIds = variants.map((v) => v.id).filter(Boolean);
  // 移除這次被刪掉的規格（曾被下單的因外鍵為 set null，不影響歷史訂單）
  let removeQuery = supabase
    .from("product_variants")
    .delete()
    .eq("product_id", data.id);
  if (keepIds.length > 0) removeQuery = removeQuery.not("id", "in", `(${keepIds.join(",")})`);
  const { error: removeError } = await removeQuery;
  if (removeError) {
    console.error(removeError);
    throw new Error(`Variants could not be updated: ${removeError.message}`);
  }

  const variantRows = variants.map((v, index) => ({
    ...(v.id ? { id: v.id } : {}),
    product_id: data.id,
    name: v.name?.trim() ? v.name.trim() : null,
    price: Number(v.price) || 0,
    discount: Number(v.discount) || 0,
    stock: isBlank(v.stock) ? null : Number(v.stock),
    weight_g: isBlank(v.weight_g) ? null : Number(v.weight_g),
    sort_order: index,
    is_active: v.is_active !== false,
  }));

  const { error: variantError } = await supabase
    .from("product_variants")
    .upsert(variantRows);

  if (variantError) {
    console.error(variantError);
    throw new Error(`Variants could not be saved: ${variantError.message}`);
  }

  return data;
}

export async function deleteProduct(id) {
  const { data, error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    console.error(error);
    throw new Error("Product could not be deleted");
  }

  return data;
}

export async function toggleProductActive(id, isActive) {
  const { data, error } = await supabase
    .from("products")
    .update({ is_active: isActive })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(error);
    throw new Error("Product status could not be updated");
  }

  return data;
}
