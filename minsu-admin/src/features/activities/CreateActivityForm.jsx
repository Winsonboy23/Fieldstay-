import { useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import styled from "styled-components";
import {
  HiOutlineArrowUpTray,
  HiOutlinePhoto,
  HiOutlinePlus,
  HiOutlineXMark,
} from "react-icons/hi2";

import Button from "../../ui/Button";
import { useCreateActivity } from "./useCreateActivity";
import { useEditActivity } from "./useEditActivity";

const Wrapper = styled.div`
  width: min(820px, 92vw);
  max-height: 86vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  form {
    display: flex;
    flex-direction: column;
    min-height: 0;
    flex: 1;
  }
`;

const ScrollBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0 0.6rem 0.4rem 0;
  min-height: 0;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1.6rem;
  padding: 0 3.2rem 1.4rem;
  margin: 0 -3.2rem 0.4rem;
  background: var(--color-grey-0);
  flex-shrink: 0;

  h2 {
    font-size: 2.4rem;
    font-weight: 700;
    color: var(--color-grey-800);
    margin: 0 0 0.4rem;
  }

  p {
    font-size: 1.3rem;
    color: var(--color-grey-500);
    margin: 0;
  }
`;

const FooterActions = styled.div`
  display: flex;
  gap: 0.8rem;
  justify-content: flex-end;
  padding: 1.4rem 3.2rem 0;
  margin: 0 -3.2rem;
  background: var(--color-grey-0);
  flex-shrink: 0;
`;

const Section = styled.section`
  background: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-lg);
  padding: 2rem 2.2rem;
  margin-bottom: 1.6rem;

  h3 {
    font-size: 1.6rem;
    font-weight: 700;
    color: var(--color-grey-700);
    margin: 0 0 1.4rem;
  }
`;

const FieldGrid = styled.div`
  display: grid;
  grid-template-columns: ${(p) => p.cols || "1fr 1fr"};
  gap: 1.2rem 1.6rem;
`;

const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 1.3rem;
  color: var(--color-grey-700);

  span.req::after {
    content: " *";
    color: var(--color-red-700);
  }
`;

const inputStyle = `
  padding: 0.9rem 1.2rem;
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-sm);
  background: var(--color-grey-0);
  font-size: 1.4rem;
  color: var(--color-grey-700);
  font-family: inherit;
  outline: none;

  &:focus {
    border-color: var(--color-brand-600);
  }
`;

const TextInput = styled.input`${inputStyle}`;
const NumberInput = styled.input.attrs({ type: "number" })`${inputStyle}`;
const DateInput = styled.input.attrs({ type: "date" })`${inputStyle}`;
const TimeInput = styled.input.attrs({ type: "time" })`${inputStyle}`;
const TextareaInput = styled.textarea`
  ${inputStyle}
  resize: vertical;
  min-height: 8rem;
`;

const ErrorText = styled.span`
  font-size: 1.2rem;
  color: var(--color-red-700);
`;

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
`;

const ImageSlot = styled.div`
  position: relative;
  aspect-ratio: 4 / 3;
  background: var(--color-grey-50);
  border: 1.5px dashed var(--color-grey-200);
  border-radius: var(--border-radius-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  color: var(--color-grey-400);
  cursor: pointer;
  overflow: hidden;

  &:hover {
    border-color: var(--color-brand-600);
    color: var(--color-brand-600);
  }

  &.has-image {
    border-style: solid;
    cursor: default;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  svg {
    width: 2.4rem;
    height: 2.4rem;
  }
`;

const RemoveBtn = styled.button`
  position: absolute;
  top: 0.6rem;
  right: 0.6rem;
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.55);
  color: white;
  border: none;
  display: grid;
  place-items: center;
  cursor: pointer;

  svg { width: 1.4rem; height: 1.4rem; }
  &:hover { background: rgba(0, 0, 0, 0.75); }
`;

const CoverBadge = styled.span`
  position: absolute;
  bottom: 0.6rem;
  left: 0.6rem;
  padding: 0.2rem 0.6rem;
  background: var(--color-brand-600);
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: var(--border-radius-sm);
`;

const HiddenFileInput = styled.input.attrs({ type: "file" })`
  display: none;
`;

const InlineAdder = styled.div`
  margin-top: 1.4rem;
  display: flex;
  gap: 0.8rem;

  > label {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    font-size: 1.3rem;
    color: var(--color-grey-700);

    input { ${inputStyle} }
  }

  button { align-self: flex-end; }
`;

const ChipList = styled.ul`
  list-style: none;
  margin: 0 0 0.6rem;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;

  li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.9rem 1.2rem;
    background: var(--color-grey-50);
    border-radius: var(--border-radius-sm);
    font-size: 1.3rem;
    color: var(--color-grey-700);
  }

  button {
    background: none;
    border: none;
    color: var(--color-grey-500);
    cursor: pointer;
    font-size: 1.6rem;
    &:hover { color: var(--color-red-700); }
  }
`;

const EmptyMsg = styled.p`
  font-size: 1.3rem;
  color: var(--color-grey-400);
  margin: 0 0 0.6rem;
`;

function CreateActivityForm({ activityToEdit = {}, onCloseModal }) {
  const { isCreating, createActivity } = useCreateActivity();
  const { isEditing, editActivity } = useEditActivity();
  const isWorking = isCreating || isEditing;

  const { id: editId, ...editValues } = activityToEdit;
  const isEditSession = Boolean(editId);

  const [highlights, setHighlights] = useState(
    Array.isArray(editValues.highlights) ? editValues.highlights : []
  );
  const [newHighlight, setNewHighlight] = useState("");

  const [notes, setNotes] = useState(
    Array.isArray(editValues.notes) ? editValues.notes : []
  );
  const [newNote, setNewNote] = useState("");

  const [coverFile, setCoverFile] = useState(null);
  const [coverUrl, setCoverUrl] = useState(editValues.image || "");
  const coverPreview = useMemo(
    () => (coverFile ? URL.createObjectURL(coverFile) : coverUrl),
    [coverFile, coverUrl]
  );
  const coverInputRef = useRef(null);

  const [existingGalleryUrls, setExistingGalleryUrls] = useState(
    Array.isArray(editValues.gallery_images) ? editValues.gallery_images : []
  );
  const [newGalleryFiles, setNewGalleryFiles] = useState([]);
  const newGalleryPreviews = useMemo(
    () => newGalleryFiles.map((f) => ({ file: f, url: URL.createObjectURL(f) })),
    [newGalleryFiles]
  );
  const galleryInputRef = useRef(null);

  // Normalize time defaults (DB returns "14:00:00")
  const defaultValues = isEditSession
    ? {
        ...editValues,
        start_time: (editValues.start_time || "").slice(0, 5),
        end_time: (editValues.end_time || "").slice(0, 5),
      }
    : { capacity: 8 };

  const { register, handleSubmit, formState } = useForm({ defaultValues });
  const { errors } = formState;

  function addHighlight() {
    const v = newHighlight.trim();
    if (!v || highlights.includes(v)) return;
    setHighlights((p) => [...p, v]);
    setNewHighlight("");
  }
  function addNote() {
    const v = newNote.trim();
    if (!v || notes.includes(v)) return;
    setNotes((p) => [...p, v]);
    setNewNote("");
  }

  function handleCoverPick(e) {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverUrl("");
    }
  }
  function clearCover() {
    setCoverFile(null);
    setCoverUrl("");
    if (coverInputRef.current) coverInputRef.current.value = "";
  }
  function handleGalleryPick(e) {
    const files = Array.from(e.target.files || []);
    if (files.length) setNewGalleryFiles((p) => [...p, ...files]);
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  }

  function onSubmit(data) {
    const coverImage = coverFile || coverUrl || editValues.image;
    if (!coverImage) {
      alert("請上傳封面圖片或輸入封面圖片 URL");
      return;
    }

    const payload = {
      ...data,
      image: coverImage,
      highlights,
      notes,
      gallery_images: existingGalleryUrls,
      gallery_files: newGalleryFiles,
    };

    const onSuccess = () => {
      setHighlights([]);
      setNotes([]);
      setCoverFile(null);
      setCoverUrl("");
      setExistingGalleryUrls([]);
      setNewGalleryFiles([]);
      onCloseModal?.();
    };

    if (isEditSession) {
      editActivity({ newActivityData: payload, id: editId }, { onSuccess });
    } else {
      createActivity(payload, { onSuccess });
    }
  }

  const galleryDisplay = [
    ...existingGalleryUrls.map((url) => ({ kind: "existing", url })),
    ...newGalleryPreviews.map(({ file, url }) => ({ kind: "new", file, url })),
  ];

  return (
    <Wrapper>
      <form onSubmit={handleSubmit(onSubmit)}>
        <HeaderRow>
          <div>
            <h2>{isEditSession ? "編輯活動" : "新增活動"}</h2>
            <p>設定活動資訊與報名規則</p>
          </div>
        </HeaderRow>

        <ScrollBody>
        {/* 基本資訊 */}
        <Section>
          <h3>基本資訊</h3>
          <Field>
            <span className="req">活動名稱</span>
            <TextInput
              placeholder="例如：傳統炊粿・紅龜粿手作"
              disabled={isWorking}
              {...register("title", { required: "請輸入活動名稱" })}
            />
            {errors.title && <ErrorText>{errors.title.message}</ErrorText>}
          </Field>

          <FieldGrid style={{ marginTop: "1.2rem" }}>
            <Field>
              <span>短標題</span>
              <TextInput
                placeholder="例如：紅龜粿手作"
                disabled={isWorking}
                {...register("short_title")}
              />
            </Field>
            <Field>
              <span>類別</span>
              <TextInput
                placeholder="例如：報名手作（留空則前台不顯示）"
                disabled={isWorking}
                {...register("category")}
              />
            </Field>
          </FieldGrid>

          <Field style={{ marginTop: "1.2rem" }}>
            <span className="req">活動簡介</span>
            <TextareaInput
              rows={3}
              placeholder="活動內容簡述..."
              disabled={isWorking}
              {...register("summary", { required: "請輸入簡介" })}
            />
            {errors.summary && <ErrorText>{errors.summary.message}</ErrorText>}
          </Field>

          <FieldGrid style={{ marginTop: "1.2rem" }}>
            <Field>
              <span className="req">人數上限</span>
              <NumberInput
                disabled={isWorking}
                {...register("capacity", {
                  required: "必填",
                  min: { value: 1, message: "至少 1" },
                })}
              />
              {errors.capacity && (
                <ErrorText>{errors.capacity.message}</ErrorText>
              )}
            </Field>
            <Field>
              <span className="req">價格 (NT$)</span>
              <NumberInput
                disabled={isWorking}
                {...register("price", {
                  required: "必填",
                  min: { value: 0, message: "至少 0" },
                })}
              />
              {errors.price && <ErrorText>{errors.price.message}</ErrorText>}
            </Field>
          </FieldGrid>
        </Section>

        {/* 活動時間 */}
        <Section>
          <h3>活動時間</h3>

          <FieldGrid cols="1fr 1fr 1fr 1fr">
            <Field>
              <span className="req">活動日期</span>
              <DateInput
                disabled={isWorking}
                {...register("activity_date", { required: "請選擇日期" })}
              />
              {errors.activity_date && (
                <ErrorText>{errors.activity_date.message}</ErrorText>
              )}
            </Field>
            <Field>
              <span className="req">開始</span>
              <TimeInput
                disabled={isWorking}
                {...register("start_time", { required: "必填" })}
              />
            </Field>
            <Field>
              <span className="req">結束</span>
              <TimeInput
                disabled={isWorking}
                {...register("end_time", { required: "必填" })}
              />
            </Field>
            <Field>
              <span>時長</span>
              <TextInput
                placeholder="2.5 hr"
                disabled={isWorking}
                {...register("duration")}
              />
            </Field>
          </FieldGrid>

        </Section>

        {/* 地點與講師 */}
        <Section>
          <h3>地點與講師</h3>
          <FieldGrid cols="1fr 1fr">
            <Field>
              <span>地點名稱</span>
              <TextInput
                placeholder="老屋廚趣"
                disabled={isWorking}
                {...register("location")}
              />
            </Field>
            <Field>
              <span>講師</span>
              <TextInput
                placeholder="陳阿嬤"
                disabled={isWorking}
                {...register("instructor")}
              />
            </Field>
          </FieldGrid>
          <Field style={{ marginTop: "1.2rem" }}>
            <span>地址</span>
            <TextInput
              placeholder="台南市..."
              disabled={isWorking}
              {...register("address")}
            />
          </Field>
        </Section>

        {/* 圖片 */}
        <Section>
          <h3>活動圖片</h3>

          <ImageGrid>
            <ImageSlot
              className={coverPreview ? "has-image" : ""}
              onClick={() => !coverPreview && coverInputRef.current?.click()}
            >
              {coverPreview ? (
                <>
                  <img src={coverPreview} alt="封面" />
                  <CoverBadge>封面</CoverBadge>
                  <RemoveBtn type="button" onClick={clearCover} aria-label="移除">
                    <HiOutlineXMark />
                  </RemoveBtn>
                </>
              ) : (
                <>
                  <HiOutlineArrowUpTray />
                  <small>上傳封面</small>
                </>
              )}
              <HiddenFileInput
                ref={coverInputRef}
                accept="image/*"
                onChange={handleCoverPick}
              />
            </ImageSlot>

            {[0, 1].map((idx) => {
              const item = galleryDisplay[idx];
              if (!item) {
                return (
                  <ImageSlot
                    key={`empty-${idx}`}
                    onClick={() => galleryInputRef.current?.click()}
                  >
                    <HiOutlinePhoto />
                  </ImageSlot>
                );
              }
              return (
                <ImageSlot key={`g-${idx}`} className="has-image">
                  <img src={item.url} alt="" />
                  <RemoveBtn
                    type="button"
                    onClick={() =>
                      item.kind === "existing"
                        ? setExistingGalleryUrls((p) =>
                            p.filter((u) => u !== item.url)
                          )
                        : setNewGalleryFiles((p) =>
                            p.filter((f) => f !== item.file)
                          )
                    }
                    aria-label="移除"
                  >
                    <HiOutlineXMark />
                  </RemoveBtn>
                </ImageSlot>
              );
            })}
          </ImageGrid>

          {galleryDisplay.length > 2 && (
            <ImageGrid style={{ marginTop: "1rem" }}>
              {galleryDisplay.slice(2).map((item, idx) => (
                <ImageSlot key={`extra-${idx}`} className="has-image">
                  <img src={item.url} alt="" />
                  <RemoveBtn
                    type="button"
                    onClick={() =>
                      item.kind === "existing"
                        ? setExistingGalleryUrls((p) =>
                            p.filter((u) => u !== item.url)
                          )
                        : setNewGalleryFiles((p) =>
                            p.filter((f) => f !== item.file)
                          )
                    }
                    aria-label="移除"
                  >
                    <HiOutlineXMark />
                  </RemoveBtn>
                </ImageSlot>
              ))}
            </ImageGrid>
          )}

          <HiddenFileInput
            ref={galleryInputRef}
            accept="image/*"
            multiple
            onChange={handleGalleryPick}
          />
          <Button
            type="button"
            variation="secondary"
            onClick={() => galleryInputRef.current?.click()}
            style={{ marginTop: "1rem" }}
          >
            <HiOutlinePlus /> 上傳更多圖片
          </Button>

          <Field style={{ marginTop: "1.2rem" }}>
            <span>或直接輸入封面 URL（可貼 unsplash 連結）</span>
            <TextInput
              placeholder="https://..."
              value={coverFile ? "" : coverUrl}
              onChange={(e) => {
                setCoverUrl(e.target.value);
                setCoverFile(null);
              }}
              disabled={isWorking || Boolean(coverFile)}
            />
          </Field>
        </Section>

        {/* 活動亮點 */}
        <Section>
          <h3>活動亮點</h3>
          {highlights.length === 0 ? (
            <EmptyMsg>尚未新增亮點</EmptyMsg>
          ) : (
            <ChipList>
              {highlights.map((h) => (
                <li key={h}>
                  <span>{h}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setHighlights((p) => p.filter((x) => x !== h))
                    }
                  >
                    ×
                  </button>
                </li>
              ))}
            </ChipList>
          )}
          <InlineAdder>
            <label>
              新增亮點
              <input
                type="text"
                placeholder="例如：每人帶走 6 顆手作紅龜粿"
                value={newHighlight}
                onChange={(e) => setNewHighlight(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addHighlight();
                  }
                }}
                disabled={isWorking}
              />
            </label>
            <Button type="button" onClick={addHighlight} disabled={isWorking}>
              <HiOutlinePlus /> 新增
            </Button>
          </InlineAdder>
        </Section>

        {/* 注意事項 */}
        <Section>
          <h3>注意事項</h3>
          {notes.length === 0 ? (
            <EmptyMsg>尚未新增注意事項</EmptyMsg>
          ) : (
            <ChipList>
              {notes.map((n) => (
                <li key={n}>
                  <span>{n}</span>
                  <button
                    type="button"
                    onClick={() => setNotes((p) => p.filter((x) => x !== n))}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ChipList>
          )}
          <InlineAdder>
            <label>
              新增注意事項
              <input
                type="text"
                placeholder="例如：請穿著輕便服裝"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addNote();
                  }
                }}
                disabled={isWorking}
              />
            </label>
            <Button type="button" onClick={addNote} disabled={isWorking}>
              <HiOutlinePlus /> 新增
            </Button>
          </InlineAdder>
        </Section>
        </ScrollBody>

        <FooterActions>
          <Button
            type="button"
            variation="secondary"
            onClick={() => onCloseModal?.()}
            disabled={isWorking}
          >
            取消
          </Button>
          <Button disabled={isWorking}>儲存</Button>
        </FooterActions>
      </form>
    </Wrapper>
  );
}

export default CreateActivityForm;
