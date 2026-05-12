import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* 링크 영역 */}
        <div className={styles.links}>
          <Link to="/terms" className={styles.link}>이용약관</Link>
          <span className={styles.divider}>|</span>
          <Link to="/privacy" className={styles.link}>개인정보취급방침</Link>
          <span className={styles.divider}>|</span>
          <Link to="/careers" className={styles.link}>인재채용</Link>
          <span className={styles.divider}>|</span>
          <Link to="/support" className={styles.link}>고객센터</Link>
        </div>

        {/* 주소 정보 */}
        <div className={styles.info}>
          <p>강남지원 1관 : 서울특별시 강남구 테헤란로14길 6 남도빌딩 2F, 3F, 4F, 5F, 6F</p>
          <p>강남지원 2관 : 서울특별시 강남구 테헤란로10길 9 그랑프리 빌딩 4F, 5F, 7F</p>
          <p>강남지원 3관 : 서울특별시 강남구 테헤란로 130 호산빌딩 5F, 6F</p>
          <p>종로지원 : 서울특별시 중구 남대문로 120 대일빌딩 2F, 3F</p>
          <p>당산지원 : 서울특별시 영등포구 선유동2로 57 이레빌딩 (구관) 19F, 20F</p>
        </div>

        {/* 저작권 */}
        <div className={styles.copyright}>
          <p>Copyright © 1998-2024 KH Information Educational Institute All Right Reserved</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
