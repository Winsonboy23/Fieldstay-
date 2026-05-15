import { useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import styled from "styled-components";
import {
  HiOutlineArrowUpTray,
  HiOutlinePhoto,
  HiOutlinePlus,
  HiOutlineXMark,
} from "react-icons/hi2";
import {
  LuSnowflake,
  LuFlame,
  LuWifi,
  LuChefHat,
  LuBath,
  LuParkingCircle,
  LuShirt,
  LuTv,
  LuCoffee,
  LuDumbbell,
  LuFan,
  LuUtensils,
} from "react-icons/lu";

import Button from "../../ui/Button";
import { useCreateRoom } from "./useCreateRoom";
import { useEditRoom } from "./useEditRoom";

const AMENITY_OPTIONS = [
  { label: "冷氣", Icon: LuSnowflake },
  { label: "暖氣設備", Icon: LuFlame },
  { label: "WiFi 上網", Icon: LuWifi },
  { label: "廚房", Icon: LuChefHat },
  { label: "專屬浴室", Icon: LuBath },
  { label: "停車位", Icon: LuParkingCircle },
  { label: "洗衣機", Icon: LuShirt },
  { label: "電視", Icon: LuTv },
  { label: "咖啡機", Icon: LuCoffee },
  { label: "健身設備", Icon: LuDumbbell },
  { label: "電風扇", Icon: LuFan },
  { label: "餐具", Icon: LuUtensils },
];

const CATEGORY_OPTIONS = [
  { value: "double", label: "雙人房 (double)" },
  { value: "family", label: "家庭房 (family)" },
  { value: "whole", label: "包棟 (whole)" },
];

const Wrapper = styled.div`
  width: min(820px, 92vw);
  max-height: 86vh;
  overflow-y: auto;
  padding-right: 0.6rem;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1.6rem;
  margin-bottom: 1.8rem;

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

const HeaderActions = styled.div`
  display: flex;
  gap: 0.8rem;
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
const TimeInput = styled.input.attrs({ type: "time" })`${inputStyle}`;
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

const AmenitiesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.8rem;
`;

const AmenityPill = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.9rem 1.2rem;
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-md);
  background: var(--color-grey-0);
  color: var(--color-grey-600);
  font-size: 1.3rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;

  svg {
    width: 1.6rem;
    height: 1.6rem;
    color: var(--color-grey-500);
  }

  &.active {
    background: var(--color-brand-50);
    border-color: var(--color-brand-600);
    color: var(--color-brand-700);

    svg { color: var(--color-brand-600); }
  }

  &:hover:not(.active) {
    border-color: var(--color-grey-300);
  }
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

const Hint = styled.p`
  font-size: 1.2rem;
  color: var(--color-grey-500);
  margin: 0.8rem 0 0;
`;

const EmptyMsg = styled.p`
  font-size: 1.3rem;
  color: var(--color-grey-400);
  margin: 0 0 0.6rem;
`;

function CreateRoomForm({ roomToEdit = {}, onCloseModal }) {
  const { isCreating, createRoom } = useCreateRoom();
  const { isEditing, editRoom } = useEditRoom();
  const isWorking = isCreating || isEditing;

  const { id: editId, ...editValues } = roomToEdit;
  const isEditSession = Boolean(editId);

  const [amenities, setAmenities] = useState(
    Array.isArray(editValues.amenities) ? editValues.amenities : []
  );
  const [customAmenity, setCustomAmenity] = useState("");

  const [rules, setRules] = useState(
    Array.isArray(editValues.house_rules) ? editValues.house_rules : []
  );
  const [newRule, setNewRule] = useState("");

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

  const { register, handleSubmit, getValues, formState } = useForm({
    defaultValues: isEditSession ? editValues : {},
  });

  const { errors } = formState;

  function toggleAmenity(label) {
    setAmenities((prev) =>
      prev.includes(label) ? prev.filter((a) => a !== label) : [...prev, label]
    );
  }

  function addCustomAmenity() {
    const v = customAmenity.trim();
    if (!v || amenities.includes(v)) return;
    setAmenities((prev) => [...prev, v]);
    setCustomAmenity("");
  }

  function removeRule(rule) {
    setRules((prev) => prev.filter((r) => r !== rule));
  }

  function addRule() {
    const v = newRule.trim();
    if (!v || rules.includes(v)) return;
    setRules((prev) => [...prev, v]);
    setNewRule("");
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
      alert("請上傳封面圖片");
      return;
    }

    const payload = {
      ...data,
      image: coverImage,
      amenities,
      house_rules: rules,
      gallery_images: existingGalleryUrls,
      gallery_files: newGalleryFiles,
    };

    const onSuccess = () => {
      setAmenities([]);
      setRules([]);
      setCoverFile(null);
      setCoverUrl("");
      setExistingGalleryUrls([]);
      setNewGalleryFiles([]);
      onCloseModal?.();
    };

    if (isEditSession) {
      editRoom({ newRoomData: payload, id: editId }, { onSuccess });
    } else {
      createRoom(payload, { onSuccess });
    }
  }

  // Build display slots: cover + first 2 gallery items
  const galleryDisplay = [
    ...existingGalleryUrls.map((url) => ({ kind: "existing", url })),
    ...newGalleryPreviews.map(({ file, url }) => ({ kind: "new", file, url })),
  ];

  return (
    <Wrapper>
      <form onSubmit={handleSubmit(onSubmit)}>
        <HeaderRow>
          <div>
            <h2>{isEditSession ? "編輯房間" : "新增房間"}</h2>
            <p>設定房間資訊和規則</p>
          </div>
          <HeaderActions>
            <Button
              type="button"
              variation="secondary"
              onClick={() => onCloseModal?.()}
              disabled={isWorking}
            >
              取消
            </Button>
            <Button disabled={isWorking}>儲存</Button>
          </HeaderActions>
        </HeaderRow>

        {/* 基本資訊 */}
        <Section>
          <h3>基本資訊</h3>

          <Field>
            <span className="req">房間名稱</span>
            <TextInput
              placeholder="例如：特色老宅雙人房"
              disabled={isWorking}
              {...register("name", { required: "請輸入房間名稱" })}
            />
            {errors.name && <ErrorText>{errors.name.message}</ErrorText>}
          </Field>

          <Field style={{ marginTop: "1.2rem" }}>
            <span>副標</span>
            <TextInput
              placeholder="例如：百年磚瓦老屋改建"
              disabled={isWorking}
              {...register("subtitle")}
            />
          </Field>

          <Field style={{ marginTop: "1.2rem" }}>
            <span className="req">房間描述</span>
            <TextareaInput
              rows={4}
              placeholder="描述房間特色..."
              disabled={isWorking}
              {...register("description", { required: "請輸入描述" })}
            />
            {errors.description && (
              <ErrorText>{errors.description.message}</ErrorText>
            )}
          </Field>

          <FieldGrid style={{ marginTop: "1.2rem" }}>
            <Field>
              <span className="req">每晚價格 (NT$)</span>
              <NumberInput
                placeholder="4800"
                disabled={isWorking}
                {...register("regularPrice", {
                  required: "請輸入價格",
                  min: { value: 1, message: "至少 1" },
                })}
              />
              {errors.regularPrice && (
                <ErrorText>{errors.regularPrice.message}</ErrorText>
              )}
            </Field>
            <Field>
              <span className="req">最多人數</span>
              <NumberInput
                placeholder="4"
                disabled={isWorking}
                {...register("maxCapacity", {
                  required: "請輸入人數",
                  min: { value: 1, message: "至少 1" },
                })}
              />
              {errors.maxCapacity && (
                <ErrorText>{errors.maxCapacity.message}</ErrorText>
              )}
            </Field>
          </FieldGrid>

          <FieldGrid cols="1fr 1fr 1fr" style={{ marginTop: "1.2rem" }}>
            <Field>
              <span>類別</span>
              <StyledSelect
                disabled={isWorking}
                defaultValue={editValues.category || "double"}
                {...register("category")}
              >
                {CATEGORY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </StyledSelect>
            </Field>
            <Field>
              <span>入住時間</span>
              <TimeInput
                defaultValue={editValues.check_in_time || "15:00"}
                disabled={isWorking}
                {...register("check_in_time")}
              />
            </Field>
            <Field>
              <span>退房時間</span>
              <TimeInput
                defaultValue={editValues.check_out_time || "11:00"}
                disabled={isWorking}
                {...register("check_out_time")}
              />
            </Field>
          </FieldGrid>

          <FieldGrid cols="1fr 1fr 1fr" style={{ marginTop: "1.2rem" }}>
            <Field>
              <span>坪數 (㎡)</span>
              <NumberInput
                placeholder="28"
                disabled={isWorking}
                {...register("area_sqm", { min: 0 })}
              />
            </Field>
            <Field>
              <span>床型</span>
              <TextInput
                placeholder="例如：1 張大床"
                disabled={isWorking}
                {...register("bed_text")}
              />
            </Field>
            <Field>
              <span>衛浴</span>
              <TextInput
                placeholder="例如：1 衛浴"
                disabled={isWorking}
                {...register("bathroom_text")}
              />
            </Field>
          </FieldGrid>

          <FieldGrid cols="1fr 1fr 1fr" style={{ marginTop: "1.2rem" }}>
            <Field>
              <span>折扣金額</span>
              <NumberInput
                defaultValue={editValues.discount ?? 0}
                disabled={isWorking}
                {...register("discount", {
                  validate: (v) =>
                    Number(v) <= Number(getValues().regularPrice || 0) ||
                    "折扣不可大於定價",
                })}
              />
              {errors.discount && (
                <ErrorText>{errors.discount.message}</ErrorText>
              )}
            </Field>
            <Field>
              <span>清潔費 (NT$)</span>
              <NumberInput
                defaultValue={editValues.cleaning_fee ?? 500}
                disabled={isWorking}
                {...register("cleaning_fee", { min: 0 })}
              />
            </Field>
            <Field>
              <span>服務費率 (0–1)</span>
              <NumberInput
                step="0.01"
                defaultValue={editValues.service_fee_rate ?? 0.05}
                disabled={isWorking}
                {...register("service_fee_rate", { min: 0, max: 1 })}
              />
            </Field>
          </FieldGrid>
        </Section>

        {/* 房間圖片 */}
        <Section>
          <h3>房間圖片</h3>

          <ImageGrid>
            {/* Cover slot */}
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

            {/* Gallery slots — show up to 2 existing/new images, plus an "add" slot if room */}
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

          {/* Extra gallery (3rd+) */}
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
            建議上傳至少 3 張圖片，第一張將作為封面。支援 JPG、PNG 格式，單張不超過 5MB
          </HelpText>
        </Section>

        {/* 房間設施 */}
        <Section>
          <h3>房間設施</h3>
          <AmenitiesGrid>
            {AMENITY_OPTIONS.map(({ label, Icon }) => {
              const active = amenities.includes(label);
              return (
                <AmenityPill
                  key={label}
                  type="button"
                  className={active ? "active" : ""}
                  onClick={() => toggleAmenity(label)}
                  disabled={isWorking}
                >
                  <Icon />
                  {label}
                </AmenityPill>
              );
            })}
          </AmenitiesGrid>

          {/* Show custom amenities not in predefined list */}
          {amenities.filter(
            (a) => !AMENITY_OPTIONS.some((o) => o.label === a)
          ).length > 0 && (
            <AmenitiesGrid style={{ marginTop: "0.8rem" }}>
              {amenities
                .filter((a) => !AMENITY_OPTIONS.some((o) => o.label === a))
                .map((label) => (
                  <AmenityPill
                    key={label}
                    type="button"
                    className="active"
                    onClick={() => toggleAmenity(label)}
                  >
                    {label}
                    <HiOutlineXMark style={{ marginLeft: "auto" }} />
                  </AmenityPill>
                ))}
            </AmenitiesGrid>
          )}

          <InlineAdder>
            <label>
              新增自訂設施
              <input
                type="text"
                placeholder="例如：游泳池、陽台、壁爐..."
                value={customAmenity}
                onChange={(e) => setCustomAmenity(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomAmenity();
                  }
                }}
                disabled={isWorking}
              />
            </label>
            <Button type="button" onClick={addCustomAmenity} disabled={isWorking}>
              <HiOutlinePlus /> 新增
            </Button>
          </InlineAdder>
        </Section>

        {/* 入住規則 */}
        <Section>
          <h3>入住規則</h3>

          {rules.length === 0 ? (
            <EmptyMsg>尚未設定入住規則</EmptyMsg>
          ) : (
            <RuleList>
              {rules.map((rule) => (
                <li key={rule}>
                  <span>{rule}</span>
                  <button
                    type="button"
                    onClick={() => removeRule(rule)}
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
              新增入住規則
              <input
                type="text"
                placeholder="例如：不可攜帶寵物、禁止吸煙、不可舉辦聚會..."
                value={newRule}
                onChange={(e) => setNewRule(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addRule();
                  }
                }}
                disabled={isWorking}
              />
            </label>
            <Button type="button" onClick={addRule} disabled={isWorking}>
              <HiOutlinePlus /> 新增
            </Button>
          </InlineAdder>

          <Hint>提示：清楚的入住規則有助於避免糾紛</Hint>
        </Section>
      </form>
    </Wrapper>
  );
}

export default CreateRoomForm;
