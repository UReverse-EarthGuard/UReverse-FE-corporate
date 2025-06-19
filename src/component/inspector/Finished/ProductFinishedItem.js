import React from 'react';
import { FaClock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import styles from './ProductFinished.module.css';

const ProductFinishedItem = ({ id, image, name, status, categoryMain, categorySub, price, date }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/inspector/finished/${id}`);
  };

  const isRejected = status === 'REJECT';
  const productItemClass = isRejected
    ? `${styles.productItem} ${styles.rejected}`
    : styles.productItem;

  return (
    <div className={productItemClass} onClick={handleClick} style={{ cursor: 'pointer' }}>
      <div className={styles.imageBox}>
        <img src={image} alt={name} className={styles.image} />
          {status === 'REJECT' && (
            <div className={styles.rejectBadge}>REJECT</div>
          )}
      </div>
      <div className={styles.infoRow}>
        <span className={styles.name}>
          <span className={styles.brand}>{name}</span>
          <span className={styles.category}> - {categoryMain}/{categorySub}</span>
        </span>
        <span className={styles.price}>{price}P</span>
      </div>
      <div className={styles.dateRow}>
        <FaClock className={styles.clockIcon} />
        <span className={styles.date}>{date}</span>
      </div>
    </div>
  );
};

export default ProductFinishedItem;
