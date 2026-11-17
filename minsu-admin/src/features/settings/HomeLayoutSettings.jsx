import styled from "styled-components";
import {
  HiOutlineArrowDown,
  HiOutlineArrowUp,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineXMark,
} from "react-icons/hi2";

import { useProducts } from "../products/useProducts";

// 首頁可排序／可隱藏的區塊（主視覺 banner 固定置頂，不在此列）。
// key 必須與前台 minsu-frontend/app/_lib/home-blocks.js 的 HOME_BLOCK_KEYS 一致。
const BLOCKS = [
  { key: "about", label: "關於我們" },
  { key: "rooms", label: "房型選擇" },
  { key: "experience", label: "田間體驗" },
  { key: "shop", label: "選物商店" },
  { key: "transport", label: "交通資訊" },
];

const MAX_FEATURED = 6;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
  padding: 0.8rem 1.2rem;
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  background: var(--color-grey-50);
  font-size: 1.4rem;
  color: var(--color-grey-700);

  &.is-hidden {
    color: var(--color-grey-400);
  }

  .order {
    width: 2.4rem;
    text-align: center;
    font-variant-numeric: tabular-nums;
    color: var(--color-grey-500);
  }

  .name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .state {
    font-size: 1.2rem;
    color: var(--color-grey-500);
  }

  img,
  .no-image {
    width: 4.8rem;
    height: 4.8rem;
    flex-shrink: 0;
    object-fit: cover;
    border-radius: var(--border-radius-sm);
    background: var(--color-grey-100);
  }
`;

const IconBtn = styled.button`
  width: 3.2rem;
  height: 3.2rem;
  flex-shrink: 0;
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-sm);
  background: var(--color-grey-0);
  color: var(--color-grey-600);
  display: grid;
  place-items: center;
  cursor: pointer;

  svg {
    width: 1.6rem;
    height: 1.6rem;
  }

  &:hover:not(:disabled) {
    background: var(--color-grey-100);
  }

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
`;

const SubHeading = styled.h4`
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--color-grey-700);
  margin: 2.4rem 0 0.6rem;
`;

const Hint = styled.p`
  font-size: 1.2rem;
  color: var(--color-grey-500);
  margin: 0 0 1.2rem;
`;

const AddSelect = styled.select`
  margin-top: 1.2rem;
  width: 100%;
  padding: 0.9rem 1.2rem;
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-sm);
  background: var(--color-grey-0);
  font-size: 1.4rem;
  color: var(--color-grey-700);
  font-family: inherit;
`;

// 存過的設定可能缺項或有舊 key：照存的順序排，沒出現過的區塊補在最後並顯示
function resolveBlocks(saved) {
  const list = Array.isArray(saved) ? saved : [];
  const seen = new Set();
  const blocks = [];
  for (const item of list) {
    const def = BLOCKS.find((b) => b.key === item?.key);
    if (!def || seen.has(def.key)) continue;
    seen.add(def.key);
    blocks.push({ ...def, visible: item.visible !== false });
  }
  for (const def of BLOCKS) {
    if (!seen.has(def.key)) blocks.push({ ...def, visible: true });
  }
  return blocks;
}

function move(list, index, step) {
  const target = index + step;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

function HomeLayoutSettings({ settings, updateSetting, disabled }) {
  const { products = [] } = useProducts();

  const blocks = resolveBlocks(settings.home_blocks);
  const shopVisible = blocks.some((b) => b.key === "shop" && b.visible);

  function saveBlocks(next) {
    updateSetting({
      home_blocks: next.map(({ key, visible }) => ({ key, visible })),
    });
  }

  const featuredIds = (
    Array.isArray(settings.home_featured_product_ids)
      ? settings.home_featured_product_ids
      : []
  ).map(Number);
  const featured = featuredIds.map((id) => ({
    id,
    product: products.find((p) => Number(p.id) === id) || null,
  }));
  const candidates = products.filter(
    (p) => p.is_active !== false && !featuredIds.includes(Number(p.id))
  );

  function saveFeatured(ids) {
    updateSetting({ home_featured_product_ids: ids });
  }

  return (
    <>
      <List>
        {blocks.map((block, idx) => (
          <Row key={block.key} className={block.visible ? "" : "is-hidden"}>
            <span className="order">{idx + 1}</span>
            <span className="name">{block.label}</span>
            <span className="state">{block.visible ? "顯示中" : "已隱藏"}</span>
            <IconBtn
              type="button"
              disabled={disabled}
              onClick={() =>
                saveBlocks(
                  blocks.map((b) =>
                    b.key === block.key ? { ...b, visible: !b.visible } : b
                  )
                )
              }
              aria-label={block.visible ? `隱藏${block.label}` : `顯示${block.label}`}
              title={block.visible ? "點一下隱藏" : "點一下顯示"}
            >
              {block.visible ? <HiOutlineEye /> : <HiOutlineEyeSlash />}
            </IconBtn>
            <IconBtn
              type="button"
              disabled={disabled || idx === 0}
              onClick={() => saveBlocks(move(blocks, idx, -1))}
              aria-label={`${block.label}上移`}
            >
              <HiOutlineArrowUp />
            </IconBtn>
            <IconBtn
              type="button"
              disabled={disabled || idx === blocks.length - 1}
              onClick={() => saveBlocks(move(blocks, idx, 1))}
              aria-label={`${block.label}下移`}
            >
              <HiOutlineArrowDown />
            </IconBtn>
          </Row>
        ))}
      </List>

      <SubHeading>首頁「選物商店」要顯示的商品</SubHeading>
      <Hint>
        依下方順序顯示，最多 {MAX_FEATURED} 個（電腦版一列 3 個）。
        沒有指定時，會自動顯示商品列表的前 3 個。
        {!shopVisible && " 目前「選物商店」區塊是隱藏的，這裡的設定要等它顯示後才看得到。"}
      </Hint>

      {featured.length > 0 && (
        <List>
          {featured.map(({ id, product }, idx) => (
            <Row key={id} className={product?.is_active === false ? "is-hidden" : ""}>
              <span className="order">{idx + 1}</span>
              {product?.image ? (
                <img src={product.image} alt="" />
              ) : (
                <span className="no-image" />
              )}
              <span className="name">
                {product ? product.name : `商品 #${id}（已刪除）`}
              </span>
              {product?.is_active === false && (
                <span className="state">已下架，首頁不會顯示</span>
              )}
              <IconBtn
                type="button"
                disabled={disabled || idx === 0}
                onClick={() => saveFeatured(move(featuredIds, idx, -1))}
                aria-label="上移"
              >
                <HiOutlineArrowUp />
              </IconBtn>
              <IconBtn
                type="button"
                disabled={disabled || idx === featured.length - 1}
                onClick={() => saveFeatured(move(featuredIds, idx, 1))}
                aria-label="下移"
              >
                <HiOutlineArrowDown />
              </IconBtn>
              <IconBtn
                type="button"
                disabled={disabled}
                onClick={() => saveFeatured(featuredIds.filter((x) => x !== id))}
                aria-label="移除"
              >
                <HiOutlineXMark />
              </IconBtn>
            </Row>
          ))}
        </List>
      )}

      <AddSelect
        value=""
        disabled={
          disabled || featured.length >= MAX_FEATURED || candidates.length === 0
        }
        onChange={(e) => {
          const id = Number(e.target.value);
          if (id) saveFeatured([...featuredIds, id]);
        }}
        aria-label="加入首頁商品"
      >
        <option value="">
          {featured.length >= MAX_FEATURED
            ? `已達上限 ${MAX_FEATURED} 個`
            : candidates.length === 0
            ? "沒有其他上架中的商品可加入"
            : "＋ 加入商品…"}
        </option>
        {candidates.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </AddSelect>
    </>
  );
}

export default HomeLayoutSettings;
