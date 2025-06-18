import React, { useState, useEffect } from 'react';
import styles from './Login.module.css';
import { FaUser, FaLock } from 'react-icons/fa';
import LoginInput from './LoginInput';
import { useNavigate } from 'react-router-dom';
import { login } from '../../../api/auth';

import image1 from "../../../assets/images/login/loginimage1.png";
import image2 from "../../../assets/images/login/loginimage2.png";
import image3 from "../../../assets/images/login/loginimage3.png";
import image4 from "../../../assets/images/login/loginimage4.png";
import image5 from "../../../assets/images/login/loginimage5.png";

const images = [image1, image2, image3, image4, image5];

function LoginBox({ isInspector }) {
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const displayDuration = 10000;
    const timer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, displayDuration);

    return () => clearTimeout(timer);
  }, [currentIndex]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(id, pw);
    if (res.success) {
      const { accessToken, role } = res.response;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('role', role);

      if (role === 'ROLE_INSPECTOR') {
        navigate('/inspector/waiting');
      } else if (role === 'ROLE_ADMIN') {
        navigate('/admin');
      } else {
        setError('권한이 없습니다.');
      }
    } else {
      setError('로그인 실패: ' + (res.error || ''));
    }
  };

  // ← 메인으로 돌아가기 클릭 핸들러
  const handleGoBack = () => {
    navigate("/");
  };

  return (
    <div className={styles.loginWrapper}>
      <div className={styles.loginimg}>
        <div className={styles.slideImageWrapper}>
          {images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`slide-${idx}`}
              className={`${styles.slideImage} ${currentIndex === idx ? styles.show : ''}`}
            />
          ))}
        </div>
      </div>

      <div className={styles.loginFormDiv}>
        <form
          className={`${styles.loginDiv} ${isInspector ? styles.inspectorBox : ''}`}
          onSubmit={handleLogin}
        >
          <div className={styles.loginContent}>
            <div className={styles.logo}>
              <span className={styles.logoText}>U:Reverse</span>
            </div>

            <LoginInput
              type="text"
              content="아이디"
              icon={FaUser}
              name="id"
              value={id}
              onChange={(e) => setId(e.target.value)}
            />
            <LoginInput
              type="password"
              content="비밀번호"
              icon={FaLock}
              name="pw"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
            />

            {error && <div className={styles.errorMsg}>{error}</div>}

            <button
              type="submit"
              className={`${styles.loginButton} ${isInspector ? styles.inspectorButton : ''}`}
            >
              로그인
            </button>

            <div className={styles.goBackText} onClick={handleGoBack}>
              ← 돌아가기
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginBox;
