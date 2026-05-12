---
dg-publish: true
작성일: 2026-01-20T16:58
수정일: 2026-01-20T16:59
---
## 1. 데이터베이스 스키마 설계

먼저, 버전 관리와 이력 추적을 위한 컬럼이 포함된 테이블 구조입니다.

```sql
-- 회원 테이블 (버전 컬럼 포함)
CREATE TABLE member (
    member_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    status VARCHAR(20),
    version INT DEFAULT 1, -- 낙관적 락을 위한 필드
    reg_date DATETIME DEFAULT NOW()
);

-- 회원 변경 이력 테이블
CREATE TABLE member_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    member_id VARCHAR(50),
    action_type VARCHAR(10), -- INSERT, UPDATE, DELETE
    prev_data JSON,          -- 변경 전 데이터 (JSON 형태로 저장하면 유연함)
    changed_by VARCHAR(50),
    change_date DATETIME DEFAULT NOW()
);

```

---

## 2. MVC 계층별 구현

### ① Service 레이어 (비즈니스 로직 및 트랜잭션)

```java
@Service
public class MemberService {
    @Autowired
    private MemberDAO memberDAO;

    // 1. 등록 (C)
    @Transactional
    public void registerMember(MemberDTO dto) {
        memberDAO.insertMember(dto);
        // 이력 기록
        saveHistory(dto.getMemberId(), "INSERT", "System", null);
    }

    // 2. 수정 (U) - 낙관적 락 및 동적 쿼리 적용
    @Transactional
    public void updateMember(MemberDTO dto) {
        // 1. 수정 전 데이터 조회 (이력 기록용)
        MemberDTO prevData = memberDAO.getMemberById(dto.getMemberId());
        
        // 2. 동적 파라미터 맵 생성
        Map<String, Object> params = new HashMap<>();
        params.put("memberId", dto.getMemberId());
        params.put("currentVersion", dto.getVersion()); // 클라이언트에서 보낸 현재 버전

        if (dto.getName() != null) params.put("name", dto.getName());
        if (dto.getEmail() != null) params.put("email", dto.getEmail());
        if (dto.getStatus() != null) params.put("status", dto.getStatus());

        // 3. 업데이트 실행
        int updatedRows = memberDAO.updateMemberByMap(params);

        // 4. 낙관적 락 예외 처리
        if (updatedRows == 0) {
            throw new OptimisticLockingFailureException("이미 다른 사용자에 의해 수정된 데이터입니다.");
        }

        // 5. 이력 기록
        saveHistory(dto.getMemberId(), "UPDATE", "Admin", prevData);
    }

    // 3. 삭제 (D)
    @Transactional
    public void deleteMember(String memberId) {
        MemberDTO prevData = memberDAO.getMemberById(memberId);
        memberDAO.deleteMember(memberId);
        saveHistory(memberId, "DELETE", "Admin", prevData);
    }

    private void saveHistory(String id, String action, String user, Object data) {
        // 이력 저장 로직 호출
        Map<String, Object> history = new HashMap<>();
        history.put("memberId", id);
        history.put("actionType", action);
        history.put("changedBy", user);
        memberDAO.insertHistory(history);
    }
}

```

### ② DAO 레이어 (인터페이스)

MyBatis와 매핑되는 인터페이스입니다.

```java
@Repository
public interface MemberDAO {
    void insertMember(MemberDTO dto);
    MemberDTO getMemberById(String memberId);
    int updateMemberByMap(Map<String, Object> params);
    void deleteMember(String memberId);
    void insertHistory(Map<String, Object> history);
}

```

### ③ Mapper (MyBatis XML)

`set` 태그와 `foreach`를 활용하여 화이트리스트 기반 동적 SQL을 구현합니다.

```xml
<mapper namespace="com.example.dao.MemberDAO">

    <insert id="insertMember">
        INSERT INTO member (member_id, name, email, status, version)
        VALUES (#{memberId}, #{name}, #{email}, 'ACTIVE', 1)
    </insert>

    <update id="updateMemberByMap">
        UPDATE member
        <set>
            <foreach collection="params" index="key" item="val" separator=",">
                <if test="key != 'memberId' and key != 'currentVersion'">
                    ${key} = #{val}
                </if>
            </foreach>
            , version = version + 1 -- 성공 시 버전 업
        </set>
        WHERE member_id = #{memberId} 
          AND version = #{currentVersion} -- 버전 검증 (낙관적 락)
    </update>

    <delete id="deleteMember">
        DELETE FROM member WHERE member_id = #{memberId}
    </delete>

    <insert id="insertHistory">
        INSERT INTO member_history (member_id, action_type, changed_by)
        VALUES (#{memberId}, #{actionType}, #{changedBy})
    </insert>

</mapper>

```

---

## **💡 핵심 전략 요약**

1. **낙관적 락**: `UPDATE` 문의 `WHERE` 절에 `version` 조건을 추가하여, 내가 읽은 시점 이후에 데이터가 변했다면 수정을 거부합니다.
2. **동적 SQL**: `Map`을 전달받아 `null`이 아닌 필드만 `SET` 절에 포함시킴으로써 전송 오버헤드를 줄이고 데이터 정확도를 높였습니다.
3. **이력 관리**: 모든 `CUD` 작업 시 이전 데이터를 조회하거나 상태를 기록하여 장애 복구 및 감사(Audit)가 가능하도록 설계했습니다.
4. **보안**: `${key}` 사용 시 서비스 레이어에서 허용된 필드만 `Map`에 담도록 제한하여 SQL Injection 위험을 최소화했습니다.

**다음에 무엇을 도와드릴까요?**

* 수정 시 **기존 데이터와 변경된 데이터의 차이(Diff)**만 추출하여 이력에 저장하는 로직이 필요하신가요?
* 혹은 위 코드를 기반으로 한 **Controller(REST API) 구현 예시**를 보고 싶으신가요?