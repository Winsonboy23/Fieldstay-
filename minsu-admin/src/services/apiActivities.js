import supabase from "./supabase";

export async function getActivities() {
  const { data, error } = await supabase
    .from("activities")
    .select("*, activity_signups(count)")
    .order("activity_date", { ascending: true });

  if (error) {
    console.error(error);
    throw new Error("Activities could not be loaded");
  }

  return data.map((a) => ({
    ...a,
    signupsCount: a.activity_signups?.[0]?.count ?? 0,
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
    .from("activity-images")
    .upload(name, file, { contentType: file.type || "image/jpeg" });
  if (error) throw new Error(`Image upload failed: ${error.message}`);
  return {
    name,
    url: supabase.storage.from("activity-images").getPublicUrl(name).data
      .publicUrl,
  };
}

function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export async function createEditActivity(payload, id) {
  // Cover image
  const image = payload.image;
  const hasNewImage = image instanceof File;
  if (!image) throw new Error("Please select a cover image");

  let coverUploadName = null;
  let imagePath = image;
  if (hasNewImage) {
    const { name, url } = await uploadOne(image);
    coverUploadName = name;
    imagePath = url;
  }

  // Gallery
  const galleryFiles = Array.isArray(payload.gallery_files)
    ? payload.gallery_files
    : [];
  const existingGalleryUrls = Array.isArray(payload.gallery_images)
    ? payload.gallery_images
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
    if (coverUploadName) {
      await supabase.storage.from("activity-images").remove([coverUploadName]);
    }
    if (uploadedNames.length > 0) {
      await supabase.storage.from("activity-images").remove(uploadedNames);
    }
    throw err;
  }

  // Build row
  const dbRow = {
    title: payload.title,
    short_title: payload.short_title || payload.title,
    category: payload.category?.trim() || "",
    summary: payload.summary || "",
    activity_date: payload.activity_date,
    start_time: payload.start_time,
    end_time: payload.end_time,
    duration: payload.duration || "",
    capacity: Number(payload.capacity) || 0,
    price: Number(payload.price) || 0,
    location: payload.location || "",
    address: payload.address || "",
    instructor: payload.instructor || "",
    image: imagePath,
    gallery_images: [...existingGalleryUrls, ...uploadedGallery],
    highlights: Array.isArray(payload.highlights) ? payload.highlights : [],
    notes: Array.isArray(payload.notes) ? payload.notes : [],
    is_published: payload.is_published !== false,
  };

  let query = supabase.from("activities");
  if (!id) {
    // Generate id from title if new
    const baseId =
      slugify(payload.short_title || payload.title) ||
      `act-${Date.now().toString(36)}`;
    dbRow.id = baseId;
    query = query.insert([dbRow]);
  } else {
    query = query.update(dbRow).eq("id", id);
  }

  const { data, error } = await query.select().single();

  if (error) {
    const toRemove = [];
    if (coverUploadName) toRemove.push(coverUploadName);
    toRemove.push(...uploadedNames);
    if (toRemove.length > 0) {
      await supabase.storage.from("activity-images").remove(toRemove);
    }
    console.error(error);
    throw new Error(`Activity could not be saved: ${error.message}`);
  }

  return data;
}

export async function deleteActivity(id) {
  const { data, error } = await supabase
    .from("activities")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    throw new Error("Activity could not be deleted");
  }

  return data;
}
