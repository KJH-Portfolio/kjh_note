
import styles from './Spinner.module.css';


// 로딩스피너 컴포넌트
function Spinner({size='md',className=''}){

    return (
        <div className={`${styles.spinner} ${styles[size]} ${className}`}>
            <div className={styles.circle}></div>
        </div>
    );
}


//전체화면 로딩 컴포넌트
export function FullPageSpinner(){
    return (
        <div className={styles.fullPage}>
            <Spinner size='lg'></Spinner>
            <p className={styles.text}>로딩 중...</p>
        </div>
    );
}

export default Spinner;