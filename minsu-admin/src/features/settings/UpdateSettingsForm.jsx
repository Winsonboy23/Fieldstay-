import { useRef, useState } from "react";
import styled from "styled-components";
import toast from "react-hot-toast";
import {
  HiOutlineArrowUpTray,
  HiOutlinePhoto,
  HiOutlineXMark,
} from "react-icons/hi2";

import Spinner from "../../ui/Spinner";
import { useSettings } from "./useSettings";
import { useUpdateSetting } from "./useUpdateSetting";
import { uploadSiteImage } from "../../services/apiSettings";

const Wrapper = styled.div`
  width: min(960px, 100%);
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

  p.hint {
    font-size: 1.2rem;
    color: var(--color-grey-500);
    margin: 0 0 1.2rem;
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

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
`;

const ImageSlot = styled.div`
  position: relative;
  aspect-ratio: 16 / 9;
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

const HiddenFileInput = styled.input.attrs({ type: "file" })`
  display: none;
`;

const LogoPreview = styled.div`
  display: flex;
  align-items: center;
  gap: 1.4rem;
  margin-top: 0.8rem;

  img {
    width: 6.4rem;
    height: 6.4rem;
    object-fit: contain;
    border: 1px solid var(--color-grey-200);
    border-radius: var(--border-radius-sm);
    background: var(--color-grey-50);
  }

  button {
    padding: 0.6rem 1.2rem;
    border: 1px solid var(--color-grey-200);
    border-radius: var(--border-radius-sm);
    background: var(--color-grey-0);
    cursor: pointer;
    font-size: 1.3rem;
    color: var(--color-grey-700);
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;

    &:hover {
      background: var(--color-grey-50);
    }
  }
`;

function UpdateSettingsForm() {
  const { isLoading, settings = {} } = useSettings();
  const { isUpdating, updateSetting } = useUpdateSetting();

  const bannerInputRef = useRef(null);
  const logoInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  if (isLoading) return <Spinner />;

  const bannerImages = Array.isArray(settings.banner_images)
    ? settings.banner_images
    : [];

  function handleBlur(e, field) {
    const value = e.target.value;
    if (value === (settings[field] ?? "")) return;
    updateSetting({ [field]: value });
  }

  async function handleBannerPick(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (bannerInputRef.current) bannerInputRef.current.value = "";

    const remainingSlots = 3 - bannerImages.length;
    if (remainingSlots <= 0) {
      toast.error("最多 3 張 banner");
      return;
    }
    const toUpload = files.slice(0, remainingSlots);

    try {
      setUploading(true);
      const urls = [];
      for (const file of toUpload) {
        const url = await uploadSiteImage(file);
        urls.push(url);
      }
      updateSetting({ banner_images: [...bannerImages, ...urls] });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  }

  function removeBanner(url) {
    updateSetting({ banner_images: bannerImages.filter((u) => u !== url) });
  }

  async function handleLogoPick(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (logoInputRef.current) logoInputRef.current.value = "";
    try {
      setUploading(true);
      const url = await uploadSiteImage(file);
      updateSetting({ logo_url: url });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  }

  const disabled = isUpdating || uploading;

  return (
    <Wrapper>
      {/* 基本資訊 */}
      <Section>
        <h3>基本資訊</h3>
        <FieldGrid>
          <Field>
            <span>品牌名稱</span>
            <TextInput
              defaultValue={settings.brand_name_zh ?? ""}
              disabled={disabled}
              onBlur={(e) => handleBlur(e, "brand_name_zh")}
            />
          </Field>
          <Field>
            <span>品牌副標</span>
            <TextInput
              defaultValue={settings.brand_tagline ?? ""}
              disabled={disabled}
              onBlur={(e) => handleBlur(e, "brand_tagline")}
            />
          </Field>
        </FieldGrid>

        <Field style={{ marginTop: "1.2rem" }}>
          <span>Logo（會連動 favicon、首頁左上與 footer logo）</span>
          <LogoPreview>
            {settings.logo_url ? (
              <img src={settings.logo_url} alt="logo" />
            ) : (
              <div
                style={{
                  width: "6.4rem",
                  height: "6.4rem",
                  border: "1px dashed var(--color-grey-200)",
                  borderRadius: "var(--border-radius-sm)",
                  display: "grid",
                  placeItems: "center",
                  color: "var(--color-grey-400)",
                  fontSize: "1.2rem",
                }}
              >
                無
              </div>
            )}
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              disabled={disabled}
            >
              <HiOutlineArrowUpTray /> 上傳 Logo
            </button>
            {settings.logo_url && (
              <button
                type="button"
                onClick={() => updateSetting({ logo_url: "" })}
                disabled={disabled}
              >
                <HiOutlineXMark /> 移除
              </button>
            )}
            <HiddenFileInput
              ref={logoInputRef}
              accept="image/*"
              onChange={handleLogoPick}
            />
          </LogoPreview>
        </Field>

        <FieldGrid style={{ marginTop: "1.2rem" }} cols="1fr 1fr 1fr">
          <Field>
            <span>LINE 連結</span>
            <TextInput
              placeholder="https://line.me/..."
              defaultValue={settings.line_url ?? ""}
              disabled={disabled}
              onBlur={(e) => handleBlur(e, "line_url")}
            />
          </Field>
          <Field>
            <span>Threads 連結</span>
            <TextInput
              placeholder="https://threads.net/..."
              defaultValue={settings.threads_url ?? ""}
              disabled={disabled}
              onBlur={(e) => handleBlur(e, "threads_url")}
            />
          </Field>
          <Field>
            <span>Instagram 連結</span>
            <TextInput
              placeholder="https://instagram.com/..."
              defaultValue={settings.instagram_url ?? ""}
              disabled={disabled}
              onBlur={(e) => handleBlur(e, "instagram_url")}
            />
          </Field>
        </FieldGrid>
        <p className="hint" style={{ marginTop: "0.8rem" }}>
          填寫的連結會連動到官網 footer 的社群媒體圖示；留空則不顯示該圖示。
        </p>
      </Section>

      {/* Banner */}
      <Section>
        <h3>首頁 Banner 輪播圖</h3>
        <p className="hint">最多 3 張，會依序顯示在官網首頁上方輪播。</p>

        <ImageGrid>
          {[0, 1, 2].map((idx) => {
            const url = bannerImages[idx];
            if (!url) {
              return (
                <ImageSlot
                  key={`empty-${idx}`}
                  onClick={() => !disabled && bannerInputRef.current?.click()}
                >
                  <HiOutlinePhoto />
                  <small>第 {idx + 1} 張</small>
                </ImageSlot>
              );
            }
            return (
              <ImageSlot key={url} className="has-image">
                <img src={url} alt="" />
                <RemoveBtn
                  type="button"
                  onClick={() => removeBanner(url)}
                  aria-label="移除"
                  disabled={disabled}
                >
                  <HiOutlineXMark />
                </RemoveBtn>
              </ImageSlot>
            );
          })}
        </ImageGrid>

        <HiddenFileInput
          ref={bannerInputRef}
          accept="image/*"
          multiple
          onChange={handleBannerPick}
        />
      </Section>

      {/* 銀行轉帳資訊 */}
      <Section>
        <h3>銀行轉帳資訊</h3>
        <p className="hint">此資訊會顯示在客戶完成訂房後的轉帳指示頁。</p>
        <FieldGrid cols="1fr 1fr">
          <Field>
            <span>銀行名稱</span>
            <TextInput
              defaultValue={settings.bank_name ?? ""}
              disabled={disabled}
              onBlur={(e) => handleBlur(e, "bank_name")}
            />
          </Field>
          <Field>
            <span>分行名稱</span>
            <TextInput
              defaultValue={settings.bank_branch ?? ""}
              disabled={disabled}
              onBlur={(e) => handleBlur(e, "bank_branch")}
            />
          </Field>
          <Field>
            <span>戶名</span>
            <TextInput
              defaultValue={settings.bank_account_name ?? ""}
              disabled={disabled}
              onBlur={(e) => handleBlur(e, "bank_account_name")}
            />
          </Field>
          <Field>
            <span>帳號</span>
            <TextInput
              defaultValue={settings.bank_account_number ?? ""}
              disabled={disabled}
              onBlur={(e) => handleBlur(e, "bank_account_number")}
            />
          </Field>
        </FieldGrid>
      </Section>

      {/* 聯絡資訊 */}
      <Section>
        <h3>聯絡資訊</h3>
        <p className="hint">會顯示在官網 footer 社群媒體圖示下方。</p>
        <FieldGrid cols="1fr 1fr">
          <Field>
            <span>客服 Email</span>
            <TextInput
              type="email"
              defaultValue={settings.contact_email ?? ""}
              disabled={disabled}
              onBlur={(e) => handleBlur(e, "contact_email")}
            />
          </Field>
          <Field>
            <span>客服電話</span>
            <TextInput
              defaultValue={settings.contact_phone ?? ""}
              disabled={disabled}
              onBlur={(e) => handleBlur(e, "contact_phone")}
            />
          </Field>
        </FieldGrid>
      </Section>
    </Wrapper>
  );
}

export default UpdateSettingsForm;
