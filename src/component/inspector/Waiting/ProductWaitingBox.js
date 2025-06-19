import React, { useEffect, useState, useCallback } from 'react';
import ProductWaitingItem from './ProductWaitingItem';
import Pagination from '../../common/Pagination/Pagination';
import styles from './ProductWaiting.module.css';
import Search from '../../common/Search/Search';
import SectionHeader from '../../common/Header/SectionHeader';
import useDebounce from '../../../hooks/useDebounce';
import { fetchProducts } from '../../../api/products';

const ProductWaitingBox = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [keyword, setKeyword] = useState('');
  const inspected = false;
  const itemsPerPage = 6;

  const debouncedKeyword = useDebounce(keyword, 500); // 0.5초 후 검색

  const fetchProductsCallback = useCallback(async () => {
    const result = await fetchProducts({
      keyword: debouncedKeyword,
      inspected,
      pageNum: currentPage,
      pageSize: itemsPerPage,
    });

    if (result.success) {
      setProducts(result.items);
      setTotalPages(result.totalPages);
    } else {
      console.error('API 응답 실패:', result.error);
      setProducts([]);
    }
  }, [debouncedKeyword, inspected, currentPage, itemsPerPage]);

  // keyword나 페이지가 바뀔 때마다 바로 검색
  useEffect(() => {
    fetchProductsCallback();
  }, [fetchProductsCallback]);

  // 검색어 입력 시 바로 반영
  const handleKeywordChange = (value) => {
    setKeyword(value);
    setCurrentPage(1);
  };

  return (
    <div className={styles.productBox}>
      <SectionHeader title="검수 대기 목록">
        <Search keyword={keyword} onKeywordChange={handleKeywordChange} />
      </SectionHeader>

      <div className={styles.grid}>
        {products.map((product) => (
          <ProductWaitingItem
            key={product.productId}
            id={product.productId}
            name={product.brandName}
            categoryMain={product.categoryMain}
            categorySub={product.categorySub}
            image={product.imageUrl}
            price={product.expectedPoint}
            date={product.updatedAt}
          />
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default ProductWaitingBox;
