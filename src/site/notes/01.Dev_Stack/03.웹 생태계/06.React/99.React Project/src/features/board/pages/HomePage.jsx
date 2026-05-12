

// / 경로로 요청되면 HomePage.jsx 보여주기 (route 설정)

import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./BoardListPage.module.css";
import boardApi from "../../../api/boardApi";


function HomePage(){
    //게시글 조회수 TOP 5 목록 출력하기 
    //기존에 작성한 BoardListPage 를 참고해서 해보시오 
    //클릭이벤트(상세보기)도 넣어주기 
    //axios는 boardApi 에 정의하고 진행하거나 해당위치에서 바로 작성하여도 됨 
    const navigate = useNavigate();
    const [topBoards,setTopBoards] = useState([]);    
    const [isLoading,setIsLoading] = useState(true);

    useEffect(()=>{
        
        const fetchTopBoard = async ()=>{

            try{
                //const response = await axios.get('/spring/board/topList');

                const data = await boardApi.getTopList();

                setTopBoards(data || []);


            }catch(error){
                console.error("TOP 5 게시글 조회 실패 ",error);
            }finally{
                setIsLoading(false);
            }
        }

        
        fetchTopBoard();

    },[]);


    //게시글 클릭 
    const handleBoardClick = (boardNo) => {
        navigate(`/board/${boardNo}`);
    }



    return (
         <div className={styles.wrapper}>
                <div className={styles.header}>
                    <h2 className={styles.title}>
                    TOP 5 게시글
                    </h2>
                </div>
                
                {/* 게시글 목록 영역 */}
                <table className={styles.table}>
                    <thead>
                        {/* tr>th[className={styles.col}]*6 */}
                        <tr>
                            <th className={styles.colNo}>글번호</th>
                            <th className={styles.colTitle}>제목</th>
                            <th className={styles.colWriter}>작성자</th>
                            <th className={styles.colCount}>조회수</th>
                            <th className={styles.colDate}>작성일</th>
                            <th className={styles.colFile}>첨부파일</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            isLoading ? (
                                <tr>
                                    <td colSpan='6' className={styles.empty}>
                                        로딩중 ...
                                    </td>
                                </tr>
                            ) : topBoards.length === 0 ? (
                                <tr>
                                    <td colSpan='6' className={styles.empty}>
                                        조회된 게시글이 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                topBoards.map((board) => (
                                    <tr key={board.boardNo}
                                        onClick= {()=>handleBoardClick(board.boardNo)}
                                        className = {styles.row}
                                    >
                                        <td>{board.boardNo}</td>
                                        <td className={styles.titleCell}>{board.boardTitle}</td>
                                        <td>{board.boardWriter}</td>
                                        <td>{board.count}</td>
                                        <td>{board.createDate}</td>
                                        <td>{board.originName ? '★' : ''}</td>
                                    </tr>
                                ))
                            )
                        }
                    </tbody>
                </table>
        </div>
    )
}

export default HomePage;