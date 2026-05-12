---
dg-publish: true
작성일: 2026-01-20T16:54
수정일: 2026-01-20T23:10
---
# MVC 패턴 기반 현대적 SQL 작성 및 데이터 관리 전략

> [!summary]
> **낙관적 락**, **변경 이력 관리** 및 MyBatis의 **`<set>`**, **`<if>`** 태그를 활용한 안정적이고 보안성이 강화된 현대적 동적 SQL 관리 전략 명사형 요약.

---

## **낙관적 락(Optimistic Locking)**을 통한 무결성 보장

* **낙관적 락**: 데이터 충돌 가능성이 낮음을 가정하여 수정 시점에 버전 일치 여부를 검증하는 방식.
* **version 컬럼**: 레코드 변경 시마다 1씩 증가하는 상태값으로, 수정 시점의 데이터 정합성 판단 기준.
* **수정 실패 처리**: `WHERE` 절 내 버전 불일치 발생 시 업데이트 건수 0 반환 및 비즈니스 예외 처리.

```sql
/* Mapper SQL: 낙관적 락 적용 */
UPDATE users
SET 
    name = #{name},
    version = version + 1
WHERE id = #{id} AND version = #{currentVersion}

```

---

## **변경 이력(Audit Log)** 자동화 및 추적

* **데이터 감사(Audit)**: 시스템 내 주요 데이터의 변경 전/후 상태와 변경 주체에 대한 물리적 기록 확보.
* **이력 테이블 구성**: 원본 스키마에 `change_type`(등록/수정/삭제), `changed_by`, `change_date` 필드 추가.
* **구현 방식**: 서비스 레이어의 트랜잭션 범위 내 이력 INSERT 수행 또는 데이터베이스 트리거(Trigger) 활용.

```sql
/* Audit Log INSERT 예시 */
INSERT INTO user_history (user_id, prev_name, changed_by, change_date)
SELECT id, name, #{modifierId}, NOW()
FROM users
WHERE id = #{id}

```

---

## **MyBatis `<set>`과 `<if>`**를 활용한 표준 동적 필드 업데이트

* **표준화된 방식**: Map 방식의 SQL Injection 위험 및 가독성 저하 문제를 해결한 MyBatis 권장 문법.
* **동적 콤마 처리**: `<set>` 태그 내부 `<if>` 조건 만족 시 생성되는 필드 간 콤마(,) 자동 제어.
* **타입 안정성**: DTO 객체를 직접 전달하여 데이터 타입 유지 및 SQL Injection 방어(`#{}` 사용).

### 1. Service 레이어: DTO 전달 및 비즈니스 로직 처리

```java
@Service
public class UserService {
    @Autowired
    private UserDAO userDAO;

    @Transactional
    public void updateUserInfo(UserDTO dto) {
        // 복잡한 가공 로직 배제 후 DTO 객체 그대로 DAO 전달
        // 변경 이력 생성 로직 등 추가 가능
        userDAO.updateUser(dto);
    }
}

```

### 2. DAO 레이어: 데이터 접근 인터페이스

```java
@Repository
public interface UserDAO {
    // MyBatis Mapper와 매핑된 추상 메서드
    int updateUser(UserDTO dto);
}

```

### 3. Mapper (MyBatis): `<set>` 및 `<if>` 구문 구현

```xml
<update id="updateUser" parameterType="UserDTO">
    UPDATE users
    <set>
        <if test="name != null">
            name = #{name},
        </if>
        <if test="phone != null">
            phone = #{phone},
        </if>
        <if test="email != null">
            email = #{email},
        </if>
        version = version + 1
    </set>
    WHERE id = #{id} 
    AND version = #{version}
</update>

```
