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
import HomeLayoutSettings from "./HomeLayoutSettings";

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

function gramsToKg(grams, fallbackKg) {
  const g = Number(grams);
  return g > 0 ? Number((g / 1000).toFixed(2)) : fallbackKg;
}

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

  function handleFeeBlur(e, field) {
    const value = Number(e.target.value) || 0;
    if (value === (settings[field] ?? 0)) return;
    updateSetting({ [field]: value });
  }

  // 重量設定：畫面用公斤，資料庫存公克；填 0 或空白就退回預設值
  function handleKgBlur(e, field, fallbackKg) {
    const kg = Number(e.target.value);
    const grams = Math.round((kg > 0 ? kg : fallbackKg) * 1000);
    if (!(kg > 0)) e.target.value = fallbackKg;
    if (grams === (settings[field] ?? fallbackKg * 1000)) return;
    updateSetting({ [field]: grams });
  }

  // 免運門檻留空 = 該溫層不提供免運
  function handleThresholdBlur(e, field) {
    const raw = e.target.value.trim();
    const value = raw === "" ? null : Number(raw) || 0;
    if (value === (settings[field] ?? null)) return;
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

      {/* 首頁區塊 */}
      <Section>
        <h3>首頁區塊</h3>
        <p className="hint">
          調整官網首頁各區塊的上下順序，或點眼睛圖示暫時隱藏。Banner 固定在最上方；
          每次調整都會立即儲存。
        </p>
        <HomeLayoutSettings
          settings={settings}
          updateSetting={updateSetting}
          disabled={disabled}
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
          <Field>
            <span>匯款期限（小時）</span>
            <TextInput
              type="number"
              min="1"
              placeholder="48"
              defaultValue={settings.payment_deadline_hours ?? 48}
              disabled={disabled}
              onBlur={(e) =>
                updateSetting({
                  payment_deadline_hours: Number(e.target.value) || 48,
                })
              }
            />
          </Field>
        </FieldGrid>
        <p className="hint" style={{ marginTop: "0.8rem" }}>
          客戶完成預約後，將在通知信中告知需於此時數內完成匯款。
        </p>
      </Section>

      {/* 商城運費 */}
      <Section>
        <h3>商城運費</h3>
        <p className="hint">
          所有商品合併成一張訂單。購物車只要有一件必須低溫的商品，整筆就走低溫宅配。
          宅配依總重分箱：箱數 = 總重 ÷ 每箱重量上限（無條件進位），每滿一次免運門檻就免一箱運費。
          例：每箱 20 公斤、門檻 2000 元時，22 公斤買 2000 元收 1 箱運費，買 4000 元全免。
          修改後只影響新訂單。
        </p>
        <FieldGrid cols="1fr 1fr">
          <Field>
            <span>常溫・超商取貨運費（元 / 件）</span>
            <TextInput
              type="number"
              min="0"
              placeholder="66"
              defaultValue={settings.ship_fee_normal ?? 66}
              disabled={disabled}
              onBlur={(e) => handleFeeBlur(e, "ship_fee_normal")}
            />
          </Field>
          <Field>
            <span>常溫・宅配運費（元 / 箱）</span>
            <TextInput
              type="number"
              min="0"
              placeholder="150"
              defaultValue={settings.ship_fee_normal_home ?? 150}
              disabled={disabled}
              onBlur={(e) => handleFeeBlur(e, "ship_fee_normal_home")}
            />
          </Field>
          <Field>
            <span>常溫・免運門檻（元，留空=不免運）</span>
            <TextInput
              type="number"
              min="0"
              placeholder="例：2000"
              defaultValue={settings.free_ship_threshold_normal ?? ""}
              disabled={disabled}
              onBlur={(e) => handleThresholdBlur(e, "free_ship_threshold_normal")}
            />
          </Field>
          <span />
          <Field>
            <span>低溫・黑貓宅配運費（元 / 箱）</span>
            <TextInput
              type="number"
              min="0"
              placeholder="180"
              defaultValue={settings.ship_fee_chilled_home ?? 180}
              disabled={disabled}
              onBlur={(e) => handleFeeBlur(e, "ship_fee_chilled_home")}
            />
          </Field>
          <Field>
            <span>低溫・免運門檻（元，留空=不免運）</span>
            <TextInput
              type="number"
              min="0"
              placeholder="例：2000"
              defaultValue={settings.free_ship_threshold_chilled ?? ""}
              disabled={disabled}
              onBlur={(e) => handleThresholdBlur(e, "free_ship_threshold_chilled")}
            />
          </Field>
        </FieldGrid>

        <p className="hint" style={{ marginTop: "2rem" }}>
          重量限制（公斤）。超商限重請依門市實際規定填寫；超過限重的訂單，結帳時就不能選那家超商。
        </p>
        <FieldGrid cols="1fr 1fr 1fr">
          <Field>
            <span>宅配每箱重量上限</span>
            <TextInput
              type="number"
              min="1"
              step="0.1"
              placeholder="20"
              defaultValue={gramsToKg(settings.ship_box_weight_g, 20)}
              disabled={disabled}
              onBlur={(e) => handleKgBlur(e, "ship_box_weight_g", 20)}
            />
          </Field>
          <Field>
            <span>7-ELEVEN 取貨限重</span>
            <TextInput
              type="number"
              min="1"
              step="0.1"
              placeholder="10"
              defaultValue={gramsToKg(settings.cvs_weight_limit_unimart_g, 10)}
              disabled={disabled}
              onBlur={(e) => handleKgBlur(e, "cvs_weight_limit_unimart_g", 10)}
            />
          </Field>
          <Field>
            <span>全家取貨限重</span>
            <TextInput
              type="number"
              min="1"
              step="0.1"
              placeholder="5"
              defaultValue={gramsToKg(settings.cvs_weight_limit_fami_g, 5)}
              disabled={disabled}
              onBlur={(e) => handleKgBlur(e, "cvs_weight_limit_fami_g", 5)}
            />
          </Field>
        </FieldGrid>
      </Section>

      {/* 入住通用資訊 */}
      <Section>
        <h3>入住通用資訊</h3>
        <p className="hint">
          匯款確認後寄給客戶的通知信中會顯示。各房型的地址、入住/退房時間請至「房型管理」設定。
        </p>
        <FieldGrid cols="1fr 1fr">
          <Field>
            <span>Wi-Fi 資訊（選填）</span>
            <TextInput
              placeholder="例：SSID: FIELDSTAY / 密碼: xxxx"
              defaultValue={settings.wifi_info ?? ""}
              disabled={disabled}
              onBlur={(e) => handleBlur(e, "wifi_info")}
            />
          </Field>
          <Field>
            <span>其他注意事項（選填）</span>
            <TextInput
              placeholder="例：禁帶寵物、請勿吸菸"
              defaultValue={settings.house_notes ?? ""}
              disabled={disabled}
              onBlur={(e) => handleBlur(e, "house_notes")}
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
