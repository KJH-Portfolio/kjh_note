

import styles from './Pagination.module.css';

//페이징바 컴포넌트
function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    pageGroupSize = 5
}){
    if(totalPages<=1) return null; //총페이지 가 1보다 작거나 같으면 처리 x

    /*
        currentPage : 현재 페이지 
        totalPages : 전체 페이지수 
        pageGroupSize : 하단에 보여지는 페이징바 개수 
    */

    //현재 페이지 그룹 계산처리 
    const currentGroup = Math.ceil(currentPage/pageGroupSize);
    const startPage = (currentGroup-1) * pageGroupSize + 1;
    const endPage = Math.min(startPage + pageGroupSize - 1,totalPages);


    //페이지 번호 배열 생성 
    const pageNumbers = [];
    for(let i= startPage; i<=endPage; i++){
        pageNumbers.push(i);
    }


    const handlePrevious = () =>{
        if(currentPage > 1){
            onPageChange(currentPage -1);
        }
    };

    const handleNext = () =>{
        if(currentPage < totalPages){
            onPageChange(currentPage + 1);
        }
    };

    return (
        <nav className={styles.pagination}>
            <ul className={styles.list}>
                {/* 이전 버튼 */}
                <li>
                    <button type='button'
                            className={`${styles.button} ${currentPage===1 ? styles.disabled : ''}`}
                            onClick={handlePrevious}
                            disabled= {currentPage===1}
                    >
                        Previous
                    </button>
                </li>
                {/* 페이지 번호 목록 */}
                {pageNumbers.map((page)=>(
                    <li key={page}>
                        <button type='button'
                                className={`${styles.button} ${styles.pageNumber} ${page===currentPage?styles.active: ''}`}
                                onClick={()=>onPageChange(page)}
                            >
                                {page}
                        </button>
                    </li>
                ))}
                {/* 다음 버튼 */}
                <li>
                    <button type='button'
                            className={`${styles.button} ${currentPage ===totalPages ? styles.disabled : ''}`}
                            onClick={handleNext}
                            disabled= {currentPage===totalPages}
                    >
                        Next
                    </button>
                </li>
            </ul>
        </nav>
    );
}

export default Pagination;