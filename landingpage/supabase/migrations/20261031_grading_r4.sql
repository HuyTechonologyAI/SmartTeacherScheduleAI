-- ============================================================================
-- EDUVIET GRADING R4 — durable, tenant-isolated grading backend (Supabase/Postgres)
-- STATUS: written + reviewed, NOT yet applied to any database (no staging DB provisioned).
-- Access: service role only (RLS enabled, deliberately NO policies for anon/authenticated).
-- ============================================================================
create table if not exists grading_staff (
  user_id uuid primary key,                      -- == auth.users.id (verified server-side)
  school_id text not null,
  role text not null check (role in ('TEACHER','HEAD_OF_DEPARTMENT','SCHOOL_ADMIN')),
  allowed_classes text[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists grading_roster (
  school_id text not null, class_id text not null, student_code text not null,
  primary key (school_id, class_id, student_code)
);

create table if not exists grading_answer_keys (
  school_id text not null, class_id text not null, subject_id text not null, exam_code text not null,
  version int not null default 1,
  blueprint jsonb not null, part1_key jsonb not null, part2_key jsonb not null, part3_key jsonb not null,
  status text not null check (status in ('DRAFT','APPROVED','REVOKED')),
  created_by text not null, approved_by text, approved_at timestamptz, approval_hash text,
  primary key (school_id, class_id, subject_id, exam_code),
  check (status <> 'APPROVED' or (approved_by is not null and approved_by <> created_by and approval_hash is not null))
);

create table if not exists grading_audit_ledger (
  school_id text not null,
  seq bigint not null,
  class_id text not null, subject_id text not null, assessment_id text not null,
  submission_id text not null, student_code text not null, exam_code text not null, key_version int not null,
  reviewer_id text not null, reviewer_role text not null, action text not null,
  original_score numeric(5,2) not null, reviewed_score numeric(5,2) not null check (reviewed_score between 0 and 10),
  reason text not null, policy_id text not null,
  server_timestamp bigint not null,
  prev_hash text not null, hmac_key_version text not null,
  entry_hash text not null, hmac text not null check (length(hmac) = 64),
  primary key (school_id, seq)                   -- serialises appends: racing writers get 23505 and retry
);

create or replace function grading_block_mutation() returns trigger language plpgsql as $$
begin raise exception 'grading_audit_ledger is append-only'; end $$;
drop trigger if exists trg_audit_no_update on grading_audit_ledger;
create trigger trg_audit_no_update before update or delete on grading_audit_ledger
  for each row execute function grading_block_mutation();
drop trigger if exists trg_audit_no_truncate on grading_audit_ledger;
create trigger trg_audit_no_truncate before truncate on grading_audit_ledger
  for each statement execute function grading_block_mutation();

create table if not exists grading_scores (
  school_id text not null, class_id text not null, subject_id text not null,
  assessment_id text not null, student_code text not null,
  score numeric(5,2) not null check (score between 0 and 10),
  exam_code text not null, audit_entry_hash text not null,
  committed_by text not null, committed_at bigint not null, revision int not null default 1,
  primary key (school_id, class_id, subject_id, assessment_id, student_code)
);
create table if not exists grading_scores_history (like grading_scores including defaults);

-- Atomic, idempotent commit: all rows or none (single function = single transaction).
create or replace function grading_commit_scores(p_rows jsonb) returns setof grading_scores
language plpgsql security invoker as $$
declare r jsonb; prev grading_scores; nxt grading_scores;
begin
  for r in select * from jsonb_array_elements(p_rows) loop
    select * into prev from grading_scores
     where school_id=r->>'school_id' and class_id=r->>'class_id' and subject_id=r->>'subject_id'
       and assessment_id=r->>'assessment_id' and student_code=r->>'student_code' for update;
    if found and prev.score = (r->>'score')::numeric and prev.audit_entry_hash = r->>'audit_entry_hash' then
      return next prev; continue;               -- idempotent replay: no new revision
    end if;
    if found then insert into grading_scores_history select prev.*; end if;
    insert into grading_scores as g values (
      r->>'school_id', r->>'class_id', r->>'subject_id', r->>'assessment_id', r->>'student_code',
      (r->>'score')::numeric, r->>'exam_code', r->>'audit_entry_hash', r->>'committed_by',
      (r->>'committed_at')::bigint, coalesce(prev.revision,0)+1)
    on conflict (school_id,class_id,subject_id,assessment_id,student_code) do update
      set score=excluded.score, exam_code=excluded.exam_code, audit_entry_hash=excluded.audit_entry_hash,
          committed_by=excluded.committed_by, committed_at=excluded.committed_at, revision=excluded.revision
    returning * into nxt;
    return next nxt;
  end loop;
end $$;

alter table grading_staff enable row level security;
alter table grading_roster enable row level security;
alter table grading_answer_keys enable row level security;
alter table grading_audit_ledger enable row level security;
alter table grading_scores enable row level security;
alter table grading_scores_history enable row level security;
revoke all on grading_staff, grading_roster, grading_answer_keys, grading_audit_ledger,
  grading_scores, grading_scores_history from anon, authenticated;
revoke execute on function grading_commit_scores(jsonb) from public, anon, authenticated;
