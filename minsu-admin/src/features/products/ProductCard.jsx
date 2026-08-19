import styled from "styled-components";
import {
  HiOutlineEye,
  HiOutlinePencilSquare,
  HiOutlineTrash,
} from "react-icons/hi2";

import Modal from "../../ui/Modal";
import ConfirmDelete from "../../ui/ConfirmDelete";
import CreateProductForm from "./CreateProductForm";
import { useDeleteProduct } from "./useDeleteProduct";
import { useToggleProductActive } from "./useToggleProductActive";
import { formatCurrency } from "../../utils/helpers";
import { getTemperature } from "../../utils/productTemperature";
import { getFrontendUrl } from "../../utils/frontendUrl";

const Card = styled.article`
  background: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-sm);
`;

const Cover = styled.div`
  position: relative;
  aspect-ratio: 16 / 9;
  background-color: var(--color-grey-100);
  background-size: cover;
  background-position: center;
`;

const StatusBadge = styled.span`
  position: absolute;
  top: 1rem;
  left: 1rem;
  padding: 0.3rem 0.8rem;
  border-radius: 9999px;
  font-size: 1.1rem;
  font-weight: 600;
  background: ${(props) =>
    props.$active ? "rgba(22, 101, 52, 0.92)" : "rgba(120, 113, 108, 0.92)"};
  color: white;
  letter-spacing: 0.05em;
`;

const TempBadge = styled.span`
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.3rem 0.8rem;
  border-radius: 9999px;
  font-size: 1.1rem;
  font-weight: 600;
  background: ${(props) => props.$color};
  color: white;
  letter-spacing: 0.05em;
`;

const StatusRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0;
  border-top: 1px solid var(--color-grey-100);
  border-bottom: 1px solid var(--color-grey-100);
  font-size: 1.4rem;
  color: var(--color-grey-500);
`;

const ToggleSwitch = styled.button`
  position: relative;
  width: 4.4rem;
  height: 2.4rem;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  background: ${(props) =>
    props.$on ? "var(--color-brand-600)" : "var(--color-grey-300)"};
  transition: background 0.2s ease;
  padding: 0;
  flex-shrink: 0;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &::after {
    content: "";
    position: absolute;
    top: 0.3rem;
    left: ${(props) => (props.$on ? "2.3rem" : "0.3rem")};
    width: 1.8rem;
    height: 1.8rem;
    border-radius: 50%;
    background: white;
    transition: left 0.2s ease;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }
`;

const Body = styled.div`
  padding: 1.6rem 2rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
`;

const Title = styled.h3`
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--color-grey-700);
  margin: 0;
`;

const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 1.4rem;
  color: var(--color-grey-500);

  strong {
    color: var(--color-grey-700);
    font-weight: 600;
  }

  strong.sold-out {
    color: var(--color-red-700);
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 0.8rem;
  margin-top: 0.4rem;
`;

const ActionButton = styled.button`
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.9rem 1rem;
  background: var(--color-grey-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-sm);
  color: var(--color-grey-700);
  font-size: 1.3rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;

  &:hover {
    background: var(--color-grey-50);
    border-color: var(--color-grey-300);
  }

  svg {
    width: 1.6rem;
    height: 1.6rem;
  }
`;

const DeleteButton = styled(ActionButton)`
  flex: 0 0 auto;
  width: 4rem;
  color: var(--color-red-700);

  &:hover {
    background: var(--color-red-100);
    border-color: var(--color-red-700);
  }
`;

function stockLabel(variants) {
  if (variants.some((v) => v.stock === null || v.stock === undefined))
    return "不限量";
  const total = variants.reduce((sum, v) => sum + Number(v.stock || 0), 0);
  return total <= 0 ? "售完" : `${total} 件`;
}

function priceLabel(variants) {
  const prices = variants.map((v) =>
    Math.max(Number(v.price || 0) - Number(v.discount || 0), 0)
  );
  if (prices.length === 0) return formatCurrency(0);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? formatCurrency(min) : `${formatCurrency(min)} 起`;
}

function ProductCard({ product }) {
  const { isDeleting, deleteProduct } = useDeleteProduct();
  const { toggleActive, isToggling } = useToggleProductActive();
  const variants = Array.isArray(product.variants) ? product.variants : [];
  const isActive = product.is_active !== false;
  const temp = getTemperature(product.temperature);
  const isSoldOut =
    variants.length > 0 &&
    variants.every(
      (v) => v.stock !== null && v.stock !== undefined && v.stock <= 0
    );

  return (
    <Modal>
      <Card style={{ opacity: isActive ? 1 : 0.7 }}>
        <Cover
          style={
            product.image ? { backgroundImage: `url(${product.image})` } : undefined
          }
        >
          <StatusBadge $active={isActive}>
            {isActive ? "上架中" : "已下架"}
          </StatusBadge>
          <TempBadge $color={temp.color}>{temp.label}</TempBadge>
        </Cover>
        <Body>
          <Title>{product.name}</Title>

          <div>
            <StatRow>
              <span>售價</span>
              <strong>{priceLabel(variants)}</strong>
            </StatRow>
            <StatRow>
              <span>規格</span>
              <strong>
                {variants.length > 1
                  ? `${variants.length} 種`
                  : variants[0]?.name || "無區分"}
              </strong>
            </StatRow>
            <StatRow>
              <span>庫存</span>
              <strong className={isSoldOut ? "sold-out" : ""}>
                {stockLabel(variants)}
              </strong>
            </StatRow>
            <StatRow>
              <span>配送方式</span>
              <strong>{temp.delivery}</strong>
            </StatRow>
          </div>

          <StatusRow>
            <span>{isActive ? "前台顯示中" : "前台不顯示"}</span>
            <ToggleSwitch
              type="button"
              $on={isActive}
              disabled={isToggling}
              onClick={() => toggleActive({ id: product.id, isActive: !isActive })}
              aria-label={isActive ? "點擊以下架此商品" : "點擊以上架此商品"}
              aria-pressed={isActive}
            />
          </StatusRow>

          <Actions>
            <ActionButton
              as="a"
              href={getFrontendUrl(`/shop/${product.id}`)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <HiOutlineEye />
              預覽
            </ActionButton>

            <Modal.Open opens="edit">
              <ActionButton type="button">
                <HiOutlinePencilSquare />
                編輯
              </ActionButton>
            </Modal.Open>

            <Modal.Open opens="delete">
              <DeleteButton type="button" aria-label="刪除">
                <HiOutlineTrash />
              </DeleteButton>
            </Modal.Open>
          </Actions>
        </Body>
      </Card>

      <Modal.Window name="edit">
        <CreateProductForm productToEdit={product} />
      </Modal.Window>

      <Modal.Window name="delete">
        <ConfirmDelete
          resourceName={`「${product.name}」`}
          disabled={isDeleting}
          onConfirm={() => deleteProduct(product.id)}
        />
      </Modal.Window>
    </Modal>
  );
}

export default ProductCard;
