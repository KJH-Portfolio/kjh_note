
//게시판 관련 API

import api from "./axios";

export const boardApi ={

    //게시글 목록 조회 

    getList : async (params ={}) =>{
        const {page=1,size=10,condition,keyword} = params;
        const response = await api.get('/board/list',{
            params : {page,size,condition,keyword}
        });

        return response.data;
    },

    //게시글 상세 조회

    getDetail : async (boardNo) =>{
        const response = await api.get(`/board/detail/${boardNo}`);

        return response.data;
    },

    //TOP 5 조회
    getTopList : async ()=>{
        const response = await api.get("/board/topList");

        return response.data;
    }

}

export default boardApi;