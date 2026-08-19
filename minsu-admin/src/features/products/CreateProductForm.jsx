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
import { useCreateProduct } from "./useCreateProduct";
import { useEditProduct } from "./useEditProduct";
import { TEMPERATURES, getTemperature } from "../../utils/productTemperature";

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
const StyledSelect = styled.select`${inputStyle}`;
const TextareaInput = styled.textarea`
  ${inputStyle}
  resize: vertical;
  min-height: 8rem;
`;

const ErrorText = styled.span`
  font-size: 1.2rem;
  color: var(--color-red-700);
`;

const DeliveryHint = styled.p`
  font-size: 1.2rem;
  color: var(--color-grey-500);
  margin: 1rem 0 0;
  padding: 0.8rem 1.2rem;
  background: var(--color-grey-50);
  border-left: 3px solid ${(p) => p.$color};
  border-radius: var(--border-radius-sm);
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
  transition: border-color 0.15s;

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

  small {
    font-size: 1.2rem;
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

const HelpText = styled.p`
  font-size: 1.2rem;
  color: var(--color-grey-500);
  margin: 1rem 0 0;
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

  button {
    align-self: flex-end;
  }
`;

const RuleList = styled.ul`
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

function CreateProductForm({ productToEdit = {}, onCloseModal }) {
  const { isCreating, createProduct } = useCreateProduct();
  const { isEditing, editProduct } = useEditProduct();
  const isWorking = isCreating || isEditing;

  const { id: editId, ...editValues } = productToEdit;
  const isEditSession = Boolean(editId);

  const [features, setFeatures] = useState(
    Array.isArray(editValues.features) ? editValues.features : []
  );
  const [newFeature, setNewFeature] = useState("");
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

  const { register, handleSubmit, watch, formState } = useForm({
    defaultValues: isEditSession
      ? editValues
      : { temperature: "normal", discount: 0, sort_order: 0 },
  });

  const { errors } = formState;
  const selectedTemp = getTemperature(watch("temperature"));

  function addFeature() {
    const v = newFeature.trim();
    if (!v || features.includes(v)) return;
    setFeatures((prev) => [...prev, v]);
    setNewFeature("");
  }

  function removeFeature(feature) {
    setFeatures((prev) => prev.filter((f) => f !== feature));
  }

  function addNote() {
    const v = newNote.trim();
    if (!v || notes.includes(v)) return;
    setNotes((prev) => [...prev, v]);
    setNewNote("");
  }

  function removeNote(note) {
    setNotes((prev) => prev.filter((n) => n !== note));
  }

  function handleCoverPick(e) {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverUrl(""); // discard old URL once a new file is picked
    }
  }

  function clearCover() {
    setCoverFile(null);
    setCoverUrl("");
    if (coverInputRef.current) coverInputRef.current.value = "";
  }

  function handleGalleryPick(e) {
    const files = Array.from(e.target.files || []);
    if (files.length) {
      setNewGalleryFiles((prev) => [...prev, ...files]);
    }
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  }

  function removeExistingGalleryAt(url) {
    setExistingGalleryUrls((prev) => prev.filter((u) => u !== url));
  }

  function removeNewGalleryFile(file) {
    setNewGalleryFiles((prev) => prev.filter((f) => f !== file));
  }

  function onSubmit(data) {
    const coverImage = coverFile || coverUrl || editValues.image;
    if (!coverImage) {
      alert("請上傳商品圖片");
      return;
    }

    const payload = {
      ...data,
      image: coverImage,
      gallery_images: existingGalleryUrls,
      gallery_files: newGalleryFiles,
      features,
      notes,
    };

    const onSuccess = () => {
      setCoverFile(null);
      setCoverUrl("");
      setExistingGalleryUrls([]);
      setNewGalleryFiles([]);
      setFeatures([]);
      setNotes([]);
      onCloseModal?.();
    };

    if (isEditSession) {
      editProduct({ newProductData: payload, id: editId }, { onSuccess });
    } else {
      createProduct(payload, { onSuccess });
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
            <h2>{isEditSession ? "編輯商品" : "新增商品"}</h2>
            <p>設定商品資訊、溫層與庫存</p>
          </div>
        </HeaderRow>

        <ScrollBody>
          {/* 基本資訊 */}
          <Section>
            <h3>基本資訊</h3>

            <Field>
              <span className="req">商品名稱</span>
              <TextInput
                placeholder="例如：手工桂花釀"
                disabled={isWorking}
                {...register("name", { required: "請輸入商品名稱" })}
              />
              {errors.name && <ErrorText>{errors.name.message}</ErrorText>}
            </Field>

            <Field style={{ marginTop: "1.2rem" }}>
              <span>副標</span>
              <TextInput
                placeholder="例如：小農契作・無添加"
                disabled={isWorking}
                {...register("subtitle")}
              />
            </Field>

            <Field style={{ marginTop: "1.2rem" }}>
              <span className="req">商品描述</span>
              <TextareaInput
                rows={4}
                placeholder="描述商品特色、成分、保存方式..."
                disabled={isWorking}
                {...register("description", { required: "請輸入描述" })}
              />
              {errors.description && (
                <ErrorText>{errors.description.message}</ErrorText>
              )}
            </Field>

            <FieldGrid style={{ marginTop: "1.2rem" }}>
              <Field>
                <span className="req">售價 (NT$)</span>
                <NumberInput
                  placeholder="380"
                  disabled={isWorking}
                  {...register("price", {
                    required: "請輸入售價",
                    min: { value: 1, message: "至少 1" },
                  })}
                />
                {errors.price && <ErrorText>{errors.price.message}</ErrorText>}
              </Field>
              <Field>
                <span>折扣金額 (NT$)</span>
                <NumberInput
                  placeholder="0"
                  disabled={isWorking}
                  {...register("discount", { min: { value: 0, message: "不可為負" } })}
                />
                {errors.discount && (
                  <ErrorText>{errors.discount.message}</ErrorText>
                )}
              </Field>
            </FieldGrid>
          </Section>

          {/* 溫層與配送 */}
          <Section>
            <h3>溫層與配送</h3>

            <Field>
              <span className="req">溫層</span>
              <StyledSelect disabled={isWorking} {...register("temperature")}>
                {TEMPERATURES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </StyledSelect>
            </Field>

            <DeliveryHint $color={selectedTemp.color}>
              {selectedTemp.label}商品的配送方式為
              <strong>「{selectedTemp.delivery}」</strong>。
              {selectedTemp.value === "chilled" &&
                "超商沒有冷藏取貨服務，冷藏商品只能宅配。"}
              {selectedTemp.value === "frozen" &&
                "7-11 冷凍交貨便無法在門市自行寄件，因此冷凍商品僅開放全家取貨。"}
              結帳時系統會依溫層分開計算運費，不同溫層無法合併成一張訂單。
            </DeliveryHint>
          </Section>

          {/* 商品詳情（選填） */}
          <Section>
            <h3>商品詳情（選填，留空則前台不顯示）</h3>

            <FieldGrid>
              <Field>
                <span>內容量／規格</span>
                <TextInput
                  placeholder="例如：600ml / 玻璃瓶"
                  disabled={isWorking}
                  {...register("spec_content")}
                />
              </Field>
              <Field>
                <span>產地</span>
                <TextInput
                  placeholder="例如：台南後壁"
                  disabled={isWorking}
                  {...register("spec_origin")}
                />
              </Field>
              <Field>
                <span>保存期限</span>
                <TextInput
                  placeholder="例如：未開封 6 個月"
                  disabled={isWorking}
                  {...register("spec_shelf_life")}
                />
              </Field>
              <Field>
                <span>保存方式</span>
                <TextInput
                  placeholder="例如：開封後冷藏，30 天內食畢"
                  disabled={isWorking}
                  {...register("spec_storage")}
                />
              </Field>
            </FieldGrid>

            <Field style={{ marginTop: "1.2rem" }}>
              <span>成分</span>
              <TextInput
                placeholder="例如：桂花、二號砂糖、檸檬汁"
                disabled={isWorking}
                {...register("spec_ingredients")}
              />
            </Field>

            <div style={{ marginTop: "1.8rem" }}>
              <Field as="div">
                <span>商品特色（前台以打勾條列顯示）</span>
              </Field>
              {features.length === 0 ? (
                <EmptyMsg>尚未新增特色</EmptyMsg>
              ) : (
                <RuleList>
                  {features.map((feature) => (
                    <li key={feature}>
                      <span>{feature}</span>
                      <button
                        type="button"
                        onClick={() => removeFeature(feature)}
                        aria-label="移除"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </RuleList>
              )}
              <InlineAdder>
                <label>
                  新增特色
                  <input
                    type="text"
                    placeholder="例如：小農契作、無添加防腐劑..."
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addFeature();
                      }
                    }}
                    disabled={isWorking}
                  />
                </label>
                <Button type="button" onClick={addFeature} disabled={isWorking}>
                  <HiOutlinePlus /> 新增
                </Button>
              </InlineAdder>
            </div>

            <div style={{ marginTop: "1.8rem" }}>
              <Field as="div">
                <span>購買須知（前台顯示於頁面下方）</span>
              </Field>
              {notes.length === 0 ? (
                <EmptyMsg>尚未新增須知（配送方式說明會自動顯示，不用重複填）</EmptyMsg>
              ) : (
                <RuleList>
                  {notes.map((note) => (
                    <li key={note}>
                      <span>{note}</span>
                      <button
                        type="button"
                        onClick={() => removeNote(note)}
                        aria-label="移除"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </RuleList>
              )}
              <InlineAdder>
                <label>
                  新增須知
                  <input
                    type="text"
                    placeholder="例如：玻璃瓶裝，到貨如有破損請拍照聯繫..."
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
            </div>
          </Section>

          {/* 庫存與排序 */}
          <Section>
            <h3>庫存與排序</h3>

            <FieldGrid cols="1fr 1fr 1fr">
              <Field>
                <span>庫存數量</span>
                <NumberInput
                  placeholder="留空 = 不限量"
                  disabled={isWorking}
                  {...register("stock", { min: { value: 0, message: "不可為負" } })}
                />
                {errors.stock && <ErrorText>{errors.stock.message}</ErrorText>}
              </Field>
              <Field>
                <span>商品重量 (公克)</span>
                <NumberInput
                  placeholder="選填"
                  disabled={isWorking}
                  {...register("weight_g", { min: { value: 0, message: "不可為負" } })}
                />
                {errors.weight_g && (
                  <ErrorText>{errors.weight_g.message}</ErrorText>
                )}
              </Field>
              <Field>
                <span>排序</span>
                <NumberInput
                  placeholder="0"
                  disabled={isWorking}
                  {...register("sort_order")}
                />
              </Field>
            </FieldGrid>

            <HelpText>
              庫存留空代表不限量；設為 0 則前台顯示「售完」但商品仍會出現。
              下架請用商品卡片上的開關。排序數字小的排前面。
              重量為選填，用於超商包裹重量限制提醒（常溫 5kg、冷凍 10kg）。
            </HelpText>
          </Section>

          {/* 商品圖片 */}
          <Section>
            <h3>商品圖片</h3>

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
                    <small>上傳圖片</small>
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
                          ? removeExistingGalleryAt(item.url)
                          : removeNewGalleryFile(item.file)
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
                          ? removeExistingGalleryAt(item.url)
                          : removeNewGalleryFile(item.file)
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

            <HelpText>
              第一張為封面，會顯示在商品列表。支援 JPG、PNG 格式，單張不超過 5MB
            </HelpText>
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

export default CreateProductForm;
