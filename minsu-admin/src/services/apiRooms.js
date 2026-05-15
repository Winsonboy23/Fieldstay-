import supabase from "./supabase";

export async function getRooms() {
  const { data, error } = await supabase
    .from("rooms")
    .select("*, bookings(count)")
    .order("id", { ascending: true });

  if (error) {
    console.error(error);
    throw new Error("Rooms could not be loaded");
  }

  return data.map((room) => ({
    ...room,
    bookingsCount: room.bookings?.[0]?.count ?? 0,
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
    .from("room-images")
    .upload(name, file, { contentType: file.type || "image/jpeg" });
  if (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }
  return {
    name,
    url: supabase.storage.from("room-images").getPublicUrl(name).data.publicUrl,
  };
}

export async function createEditRoom(newRoom, id) {
  // --- Cover image ---
  const image = newRoom.image;
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
  const galleryFiles = Array.isArray(newRoom.gallery_files)
    ? newRoom.gallery_files
    : [];
  const existingGalleryUrls = Array.isArray(newRoom.gallery_images)
    ? newRoom.gallery_images
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
      await supabase.storage.from("room-images").remove([coverUploadName]);
    }
    if (uploadedNames.length > 0) {
      await supabase.storage.from("room-images").remove(uploadedNames);
    }
    throw err;
  }

  // --- Build payload ---
  const houseRulesValue = Array.isArray(newRoom.house_rules)
    ? newRoom.house_rules
    : String(newRoom.house_rules || "")
        .split(/\r?\n|,/)
        .map((s) => s.trim())
        .filter(Boolean);

  const roomPayload = {
    name: newRoom.name,
    subtitle: newRoom.subtitle || null,
    category: newRoom.category || "double",
    maxCapacity: Number(newRoom.maxCapacity) || 1,
    area_sqm: newRoom.area_sqm ? Number(newRoom.area_sqm) : null,
    bed_text: newRoom.bed_text || null,
    bathroom_text: newRoom.bathroom_text || null,
    regularPrice: Number(newRoom.regularPrice) || 0,
    discount: Number(newRoom.discount) || 0,
    cleaning_fee:
      newRoom.cleaning_fee !== undefined && newRoom.cleaning_fee !== ""
        ? Number(newRoom.cleaning_fee)
        : 500,
    service_fee_rate:
      newRoom.service_fee_rate !== undefined && newRoom.service_fee_rate !== ""
        ? Number(newRoom.service_fee_rate)
        : 0.05,
    description: newRoom.description || "",
    image: imagePath,
    check_in_time: newRoom.check_in_time || "15:00",
    check_out_time: newRoom.check_out_time || "11:00",
    amenities: Array.isArray(newRoom.amenities) ? newRoom.amenities : [],
    house_rules: houseRulesValue,
    gallery_images: [...existingGalleryUrls, ...uploadedGallery],
  };

  // --- DB write ---
  let query = supabase.from("rooms");
  if (!id) query = query.insert([roomPayload]);
  else query = query.update(roomPayload).eq("id", id);

  const { data, error } = await query.select().single();

  if (error) {
    // Rollback uploads on failure
    const toRemove = [];
    if (coverUploadName) toRemove.push(coverUploadName);
    toRemove.push(...uploadedNames);
    if (toRemove.length > 0) {
      await supabase.storage.from("room-images").remove(toRemove);
    }
    console.error(error);
    throw new Error(`Room could not be saved: ${error.message}`);
  }

  return data;
}

export async function deleteRoom(id) {
  const { data, error } = await supabase.from("rooms").delete().eq("id", id);

  if (error) {
    console.error(error);
    throw new Error("Rooms could not be deleted");
  }

  return data;
}
