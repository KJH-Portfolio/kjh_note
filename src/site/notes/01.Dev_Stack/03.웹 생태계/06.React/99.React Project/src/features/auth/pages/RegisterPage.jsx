import { useState } from "react";
import { useNavigate } from "react-router-dom";
import authApi from "../../../api/authApi";
import styles from './RegisterPage.module.css';
import Input from "../../../components/commons/ui/Input";
import Button from "../../../components/commons/ui/Button";


function RegisterPage() {
    const navigate = useNavigate();
    const [formData,setFormData] = useState({
        userId : '',
        userPwd : '',
        checkPwd : '',
        userName : '',
        email : '',
        age : '',
        phone : '',
        address : '',
        gender : 'M',
    });

    const [errors,setErrors] = useState({});
    const [idCheckResult,setIdCheckResult] = useState(null);
    const [isLoading,setIsLoading] = useState(false);

    const handleChange = (e) =>{
        const {name,value} = e.target;
        setFormData((prev)=>({
            ...prev,
            [name] : value
        }));

        //아이디 상태 변경시 중복체크 결과 초기화
        if(name === 'userId'){
            setIdCheckResult(null);
        }

        //해당 필드 에러 초기화
        if(errors[name]){
            setErrors((prev) =>({
                ...prev,
                [name] : '',
            }))
        }
    };


        //아이디 중복 체크 
        const handleIdCheck = async ()=>{
            const {userId} = formData;

            if(userId.length<5){
                setIdCheckResult({
                    valid: false,
                    message : '아이디는 5글자 이상 입력하세요.'
                });
                return;
            }

            try{
                //아이디중복체크용 요청 만들어서 사용하기 
                const result = await authApi.checkIdDuplicate(userId); 
                if(result ==='NNNNY'){
                    setIdCheckResult({
                        valid : true,
                        message : '사용 가능한 아이디입니다.'
                    });
                }else{
                    setIdCheckResult({
                        valid : false,
                        message : '사용 불가능한 아이디입니다.'
                    });
                }
            }catch(error){
                setIdCheckResult({
                    valid : false,
                    message : '중복 체크에 실패했습니다.'
                })
            }
        };

    //유효성 검사 
    const validate = () =>{
        const newErrors = {};

        if(!formData.userId){
            newErrors.userId = '아이디를 입력하세요.';
        }else if(formData.userId.length<5){
            newErrors.userId = '아이디는 5글자 이상이여야합니다.';
        }

        if(!formData.userPwd){
            newErrors.userPwd = '비밀번호를 입력하세요.';
        }

         if(formData.userPwd !== formData.checkPwd){
            newErrors.userPwd = '비밀번호가 일치하지 않습니다.';
        }

         if(!formData.userName){
            newErrors.userName = '이름을 입력하세요.';
        }

         if(!idCheckResult?.valid){
            newErrors.userId = '아이디 중복 체크를 해주세요.';
        }

        setErrors(newErrors);

        //위에서 오류가 발생하여 newError에 key가 담겨있을테니 객체가 비어있는지 판별하는 코드 
        //Object.keys == 객체의 키값들을 배열로 변환 
        return Object.keys(newErrors).length === 0; //true면 에러 없음 false 면 에러 
    }

    const handleSubmit = async (e) =>{
        e.preventDefault();

        if(!validate()) return; //위에 검사결과 false면 에러 라서 리턴 

        setIsLoading(true);

        try{
            const {checkPwd,...submitData} = formData;
            await authApi.register(submitData);
            alert('회원가입이 완료되었습니다!');
            navigate('/');
        }catch(error){
            alert(error.reponse?.data?.message || '회원가입에 실패했습니다.');
        }finally{
            setIsLoading(false);
        }
    };

    return (
        <div className='container'>
            <div className={styles.wrapper}>
                <h2 className={styles.title}>회원가입</h2>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.idField}>

                        <Input 
                            label="ID"
                            type="text"
                            name="userId"
                            value={formData.userId}
                            onChange={handleChange}
                            onBlur={handleIdCheck}
                            placeholder="아이디를 입력하세요"
                            error={errors.userId}
                            required
                            fullWidth
                        />
                        {
                            idCheckResult &&(
                                <p className={`${styles.idCheckResult} ${idCheckResult.valid ? styles.valid : styles.invalid}`}>
                                    {idCheckResult.message}
                                </p>
                            )
                        }
                        <Input 
                            label="Password"
                            type="password"
                            name="userPwd"
                            value={formData.userPwd}
                            onChange={handleChange}
                            placeholder="비밀번호를 입력하세요"
                            error={errors.userPwd}
                            required
                            fullWidth
                        />

                          <Input 
                            label="Password Check"
                            type="password"
                            name="checkPwd"
                            value={formData.checkPwd}
                            onChange={handleChange}
                            placeholder="비밀번호를 입력하세요"
                            error={errors.checkPwd}
                            required
                            fullWidth
                        />

                        <Input 
                            label="Name"
                            type="text"
                            name="userName"
                            value={formData.userName}
                            onChange={handleChange}
                            placeholder="이름을 입력하세요"
                            error={errors.userName}
                            required
                            fullWidth
                        />

                        <Input 
                            label="Email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="이메일을 입력하세요"
                            fullWidth
                        />

                          <Input 
                            label="Age"
                            type="number"
                            name="age"
                            value={formData.age}
                            onChange={handleChange}
                            placeholder="나이를 입력하세요"
                            fullWidth
                        />

                          <Input 
                            label="Phone"
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="전화번호를 입력하세요"
                            fullWidth
                        />

                          <Input 
                            label="Address"
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="주소를 입력하세요"
                            fullWidth
                        />

                        {/* 성별 */}
                        <div className={styles.genderField}>
                            <label className={styles.label}>Gender</label>
                            <div className={styles.radioGroup}>
                                <label className={styles.radioLabel}>
                                    <input type="radio" 
                                            name="gender"
                                            value="M"
                                            checked={formData.gender === 'M'}
                                            onChange={handleChange}
                                    />
                                    남자 
                                </label>

                                <label className={styles.radioLabel}>
                                    <input type="radio" 
                                            name="gender"
                                            value="F"
                                            checked={formData.gender === 'F'}
                                            onChange={handleChange}
                                    />
                                    여자 
                                </label>
                            </div>
                        </div>

                        <div className={styles.buttons}>
                            <Button
                                type="submit"
                                variant="primary"
                                loading={isLoading}
                                disabled={!idCheckResult?.valid}
                            >
                                회원가입
                            </Button>
                            <Button type="reset" variant='danger'>
                                초기화
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default RegisterPage;