import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import boardApi from "../../../api/boardApi";
import styles from "./BoardDetailPage.module.css";
import Button from "../../../components/commons/ui/Button";
import { useCallback, useEffect, useState } from "react";
import replyApi from "../../../api/replyApi";


function BoardDetailPage(){

    //전달값 받아오기(게시글번호)
    const {boardNo} = useParams();
    const navigate = useNavigate();
    const {user,isAithenticated} = useAuth();

    
    //게시글 정보,댓글정보 등 
    const [board,setBoard] = useState(null);
    const [replies,setReplies] = useState([]);
    const [replyCotent,setReplyContent] = useState('');
    const [isLoading,setIsLoading] = useState(true);


    //게시글 상세 조회
    useEffect(()=>{
        const fetchBoard = async () =>{
            try{
                const data = await boardApi.getDetail(boardNo);
               
                //console.log(data);

                setBoard(data);
                    
                }catch(error){
                    console.error('게시글 조회 실패 ',error);
                    alert('게시글을 조회할 수 없습니다.');
                    navigate('/board');
                }finally{
                    setIsLoading(false);
                }
        }
        fetchBoard();
    },[boardNo,navigate]);

    //받아온 게시글 정보는 알맞은 위치에 출력하기 

    //댓글 목록 조회 (replyApi.js 만들어서 댓글 목록 조회해와 만들어둔 replies 에 상태 처리하고 목록 뽑아보기 )
    const fetchReplies = useCallback(async()=>{
        try{

            const data = await replyApi.getList(boardNo);
            
            //console.log(data);
            
            setReplies(data);

        }catch(error){
            console.error('댓글 조회 실패',error)
        }

    },[boardNo]);//다른 게시글 정보로 처리될때 재생성

    useEffect(()=>{
        fetchReplies();
    },[fetchReplies]); //해당 호출함수가 갱신될때마다 (boardNo 변경되어 다른 게시글 조회시)


    //게시글 수정

    //게시글 삭제 

    //댓글 등록 

    //목록으로 
    const handleGoList = () =>{
        navigate("/board");
    }

    if(isLoading){
        return (
            <div className="container">
                <div className={styles.wrapper}>
                    <p className={styles.loading}>로딩 중 ...</p>
                </div>
            </div>
        );
    }

    //작성자 확인 
    const isAuthor = user?.userId === board.boardWriter;

    return (
        <div className ="container">
            <div className={styles.wrapper}>
                <h2 className={styles.title}>게시글 상세보기</h2>

                <div className={styles.actions}>
                    <Button variant="secondary" onClick={handleGoList}> 
                        목록으로
                    </Button>
                </div>

                {/* 게시글 내용 */}
                <table className={styles.table}>
                    <tbody>
                        <tr>
                            <th>제목</th>
                            <td colSpan='3'>{board.boardTitle}</td>
                        </tr>

                        <tr>
                            <th>작성자</th>
                            <td>{board.boardWriter}</td>
                            <th>작성일</th>
                            <td>{board.createDate}</td>
                        </tr>

                        <tr>
                            <th>첨부파일</th>
                            <td colSpan='3'>
                                {/* 있으면 a태그 없으면 첨부파일이 없습니다. */}
                                {
                                    board.originName ? (
                                        <a href={board.changeName} className={styles.fileLink}>{board.originName}</a>
                                    ) :(
                                        '첨부파일이 없습니다.'
                                    )
                                }
                            </td>
                        </tr>
                        <tr>
                            <th>내용</th>
                            <td colSpan='3'></td>
                        </tr>
                        <tr>
                            <td colSpan='4' className={styles.content}>
                                {board.boardContent}
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* 수정,삭제 버튼 */}
                {
                    isAuthor && (
                        <div className={styles.authorActions}>
                            <Button variant="primary" onClick={handleEdit}>
                                수정하기
                            </Button>
                             <Button variant="danger" onClick={handleDelete}>
                                삭제하기
                            </Button>
                        </div>
                    )
                }

                {/* 댓글 영역 */}
                <div className={styles.replySection}>
                    <div className={styles.replyForm}>
                        {
                            isAithenticated ? (
                                <textarea 
                                    // value={}
                                    // onChange= {}
                                    placeholder="댓글을 입력하세요"
                                    className={styles.replyInput}
                                />
                            ): (
                                <textarea
                                    placeholder="로그인 후 이용가능힙니다."
                                    className={styles.replyInput}
                                    readOnly
                                />
                            )
                        }
                        <Button variant="secondary" 
                                // onClick={} 
                                disabled={!isAithenticated}
                          
                        >  등록하기</Button>
                    </div>

                    <div className={styles.replyCount}>
                        댓글 (<span>{replies.length}</span>) 개 
                    </div>

                    <div className={styles.replyList}>
                        {
                            replies.length === 0?(
                                <p className={styles.noReply}>
                                    등록된 댓글이 없습니다.
                                </p>
                            ):(
                                // 댓글목록 
                                replies.map((reply)=>(

                                <div 
                                    key={reply.replyNo} 
                                    className={styles.replyItem}>
                                    <span className={styles.replywriter}>{reply.replyWriter}</span>
                                    <span className={styles.replyContent}>{reply.replyContent}</span>
                                    <span className={styles.replyDate}>{reply.createDate}</span>
                                </div>
                                ))
                            )
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BoardDetailPage;