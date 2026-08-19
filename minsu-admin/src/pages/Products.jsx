import styled from "styled-components";
import { HiOutlinePlus } from "react-icons/hi2";

import Spinner from "../ui/Spinner";
import Empty from "../ui/Empty";
import Modal from "../ui/Modal";
import Button from "../ui/Button";

import { useProducts } from "../features/products/useProducts";
import ProductCard from "../features/products/ProductCard";
import CreateProductForm from "../features/products/CreateProductForm";

const PageHeader = styled.header`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1.6rem;
  margin-bottom: 2.4rem;

  h1 {
    font-size: 2.8rem;
    font-weight: 700;
    color: var(--color-grey-800);
    margin: 0 0 0.4rem;
  }

  p {
    color: var(--color-grey-500);
    font-size: 1.5rem;
    margin: 0;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.8rem;
`;

const AddButton = styled(Button)`
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
`;

function Products() {
  const { isLoading, products } = useProducts();

  if (isLoading) return <Spinner />;

  return (
    <Modal>
      <PageHeader>
        <div>
          <h1>商品管理</h1>
          <p>管理網購商品的溫層、價格與庫存</p>
        </div>
        <Modal.Open opens="create-product">
          <AddButton>
            <HiOutlinePlus />
            新增商品
          </AddButton>
        </Modal.Open>
      </PageHeader>

      {!products?.length ? (
        <Empty resourceName="products" />
      ) : (
        <Grid>
          {products.map((product) => (
            <ProductCard product={product} key={product.id} />
          ))}
        </Grid>
      )}

      <Modal.Window name="create-product">
        <CreateProductForm />
      </Modal.Window>
    </Modal>
  );
}

export default Products;
