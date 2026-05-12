import { Route, Routes } from "react-router-dom";
import RegisterPage from "../features/auth/pages/RegisterPage";
import MyPage from "../features/auth/pages/MyPage";
import BoardListPage from "../features/board/pages/BoardListPage";
import BoardDetailPage from "../features/board/pages/BoardDetailPage";
import HomePage from "../features/board/pages/HomePage";
import PrivateRoute from "./PrivateRouter";


function AppRouter() {
    return (
        <Routes>

            {/* 메인 */}
            <Route path="/" element={<HomePage/>}></Route>
            {/* 인증  */}
            <Route path="/register" element={<RegisterPage/>}/>
            <Route path="/mypage" element={
                        <PrivateRoute>
                            <MyPage/>
                        </PrivateRoute>
                        }/>
            


            {/* 자유게시판 */}
            <Route path="/board" element={<BoardListPage/>}/>
            <Route path="/board/:boardNo" element={<BoardDetailPage/>}/>


        </Routes>

    )


}

export default AppRouter;
