
import Footer from './Footer';
import Header from './Header';
import styles from './Layout.module.css';
/*
    레이아웃 컴포넌트 
    Header,footer를 포함한 기본 레이아웃 (기존 main.jsp처럼)

*/


function Layout({children}){
    return (
        <div className={styles.layout}>
            <Header></Header>
            <main className={styles.main}>{children}</main>
            <Footer></Footer>

        </div>
    );
}

export default Layout;