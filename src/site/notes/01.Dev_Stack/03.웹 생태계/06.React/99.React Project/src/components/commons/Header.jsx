
import { useState } from 'react';
import styles from './Header.module.css';

import {Link, useNavigate} from 'react-router-dom';
import LoginModal from '../../features/auth/components/LoginModal';
import { useAuth } from '../../context/AuthContext';

function Header () {

    //사용자 정보,인증상태값,로그아웃함수 
    const {user,isAuthenticated,logout} = useAuth();

    //모달 상태값
    const [isLoginModalOpen,setIsLoginModalOpen] = useState(false);

    const navigate = useNavigate(); 

    //로그아웃 핸들러
    const handleLogout = async () =>{
        
        //로그아웃함수 받아오기 
        await logout();

        //navigate('/'); //페이지이동함수

    }


    return (
        <>
            <header className={styles.header}>
                <div className={styles.container}>
                    {/* 상단 영역 */}
                    <div className={styles.topArea}>
                        <div className={styles.logo}>
                            <Link to="/">
                                <img src="https://www.iei.or.kr/resources/images/common/top_logo_s.jpg" />
                            </Link>
                        </div>


                        <div className={styles.userArea}>
                            {/* 추후 context에서 가져올 로그인 상태값으로 처리할 위치 */}
                            {isAuthenticated ? (
                            <>
                                <span className={styles.welcome}>
                                    <strong>{user?.userName}님 환영합니다</strong>
                                </span>

                                <Link to="/mypage" className={styles.link}>
                                    마이페이지
                                </Link>
                                
                                <button onClick={handleLogout} className={styles.link}>
                                    로그아웃
                                </button>
                            </>
                            ):(
                                <>
                                    <Link to="/register" className={styles.link}>
                                        회원가입 
                                    </Link>
                                    <button onClick={()=>setIsLoginModalOpen(true)} className={styles.link}>
                                        로그인
                                    </button>
                            
                                 </>
                            )}          

                        </div>
                    </div>


                    {/* 네비바 */}
                    <nav className={styles.nav}>
                        <ul className={styles.navList}>
                            {/* (li>Link[className={styles.}])*5 */}
                            <li>
                                <Link to='/'className={styles.navLink}>HOME</Link>
                            </li>
                            <li>
                                <Link to='/notice'className={styles.navLink}>공지사항</Link>
                            </li>
                            <li>
                                <Link to='/board'className={styles.navLink}>자유게시판</Link>
                            </li>
                            <li>
                                <Link to='/photo'className={styles.navLink}>사진게시판</Link>
                            </li>
                            <li>
                                <Link to='/chat'className={styles.navLink}>채팅</Link>
                            </li>
                        </ul>
                    </nav>
                </div>
            </header>


            {/* 로그인 모달 */}
            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={()=>setIsLoginModalOpen(false)}
            />
        
        </>
    );
}

export default Header;