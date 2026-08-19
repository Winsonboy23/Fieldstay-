import supabase from "./supabase";

const BUCKET = "product-images";

export async function getProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    console.error(error);
    throw new Error("Products could not be loaded");
  }

  return data;
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
    price: Number(newProduct.price) || 0,
    discount: Number(newProduct.discount) || 0,
    temperature: newProduct.temperature || "normal",
    // 留空 = 不限量
    stock: isBlank(newProduct.stock) ? null : Number(newProduct.stock),
    weight_g: isBlank(newProduct.weight_g) ? null : Number(newProduct.weight_g),
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
