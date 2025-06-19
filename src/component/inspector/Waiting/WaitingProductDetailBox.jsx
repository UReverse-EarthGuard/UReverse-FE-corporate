import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductInfoSection from '../common/ProductInfoSection';
import SectionHeader from '../../common/Header/SectionHeader';
import styles from './ProductWaitingDetailBox.module.css';
import {
  fetchPendingProductDetail,
  submitProductInspection,
} from '../../../api/products';
import { loadWaitingProductForm } from '../../../utils/localStorageUtils';
import InspectionForm from './form/InspectionForm';
import LastSavedIndicator from '../../common/LastSavedIndicator';

const WaitingProductDetailBox = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const defaultForm = {
    result: '',
    notes: '',
    isTorn: 'N',
    hasStain: 'N',
    hasFading: 'N',
    isStretched: 'N',
    otherDefect: 'N',
    grade: '',
  };

  const [form, setForm] = useState(() =>
    loadWaitingProductForm(id, defaultForm)
  );
  const [loading, setLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);
  const [modalImg, setModalImg] = useState(null);
  const navigate = useNavigate();

  // 지급 포인트 계산
  const gradeRates = { S: 1, A: 0.7, B: 0.5, C: 0.3, F: 0 };
  const gradeColors = {
    S: '#27ae60',
    A: '#f39c12',
    B: '#2980b9',
    C: '#d35400',
    F: '#c0392b',
  };
  const selectedRate = gradeRates[form.grade] ?? 1;
  const selectedColor = gradeColors[form.grade] ?? '#222';

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetchPendingProductDetail(id);
        if (res.success) setProduct(res.response);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const saved = localStorage.getItem(`waitingProductForm_${id}`);
    if (saved) {
      try {
        setForm(JSON.parse(saved).form);
      } catch {
        setForm(defaultForm);
      }
    } else {
      setForm(defaultForm);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    // form 값이 바뀔 때마다 임시 저장
    if (form) {
      const now = new Date();
      localStorage.setItem(
        `waitingProductForm_${id}`,
        JSON.stringify({ form, savedAt: now.toISOString() })
      );
      setLastSaved(now.toISOString());
    }
  }, [form, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // 등급이 바뀌면 result도 자동 변경
    if (name === 'grade') {
      setForm((f) => ({
        ...f,
        [name]: value,
        result: value === 'F' ? 'FAIL' : 'PASS',
      }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 필수값 검사
    const requiredFields = [
      'grade',
      'isTorn',
      'hasStain',
      'hasFading',
      'isStretched',
      'otherDefect',
    ];

    const missingFields = requiredFields.filter((field) => !form[field]);

    if (!form.grade) {
      alert('등급을 선택해 주세요.');
      return;
    }

    if (missingFields.length > 0) {
      alert('하자 여부를 모두 선택해 주세요.');
      return;
    }

    try {
      await submitProductInspection({
        productId: product.productId,
        ...form,
      });
      alert('검수 결과가 등록되었습니다!');
      navigate('/inspector/waiting');
    } catch {
      alert('검수 등록 실패');
    }
  };

  if (loading) return <div>로딩중...</div>;
  if (!product) return <div>상품 정보를 불러올 수 없습니다.</div>;

  const discountedPoint = Math.round(product.expectedPoint * selectedRate);

  return (
    <div className={styles['detail-container']}>
      <SectionHeader title="검수 대기 상품 상세">
      </SectionHeader>

      <ProductInfoSection product={product} setModalImg={setModalImg} showHumanResult={false}/>

      <InspectionForm
        form={form}
        onChange={handleChange}
        onSubmit={handleSubmit}
        product={product}
        selectedColor={selectedColor}
        selectedRate={selectedRate}
        discountedPoint={discountedPoint}
        navigate={navigate}
      />
    </div>
  );
};

export default WaitingProductDetailBox;
