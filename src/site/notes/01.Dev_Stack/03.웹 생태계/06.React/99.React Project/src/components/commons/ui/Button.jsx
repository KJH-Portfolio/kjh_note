
import styles from './Button.module.css';

// 버튼 컴포넌트 


function Button({
                    children,
                    variant = 'primary',
                    size = 'md',
                    fullWidth = false,
                    disabled = false,
                    loading = false,
                    type = 'button',
                    className = '',
                    onClick,
                    ...props
                }) {

    const buttonClass = [
        styles.button,
        styles[variant],
        styles[size],
        fullWidth ? styles.fullWidth : '',
        loading ? styles.loading : '',
        className
    ].filter(Boolean).join(' '); //className에 넣을 스타일 처리 배열중 거짓요소 판별 후 필터링하여 ' ' 공백으로 연결

    return (
        <button 
            type={type}
            className={buttonClass}
            disabled={disabled||loading}
            onClick={onClick}
            {...props}
        >
            {loading && <span className={styles.spinner}></span>}
            <span className={loading ? styles.hidden : ''}>{children}</span>
        </button>
    );
}

export default Button;