-- Run this once in Supabase: Dashboard > SQL Editor > New query > paste all > Run

create extension if not exists "uuid-ossp";

create table if not exists teachers (
  id uuid primary key default uuid_generate_v4(),
  name text not null
);

create table if not exists students (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  track text not null default 'Hifz',
  teacher_id uuid references teachers(id) on delete set null,
  parent_contact text,
  xp int not null default 0,
  streak int not null default 0,
  last_active date,
  attendance_log jsonb not null default '[]',
  mistakes_log jsonb not null default '[]',
  memorized jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create table if not exists classes (
  id uuid primary key default uuid_generate_v4(),
  day text not null,
  time text not null,
  teacher_id uuid references teachers(id) on delete set null,
  track text not null
);

create table if not exists referrals (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  contact text,
  status text not null default 'Invited'
);

-- Row Level Security: only signed-in staff can read/write.
-- This is a "any authenticated user = trusted staff" model, appropriate for
-- a small team where you control who can sign in (see README on restricting signups).
alter table teachers enable row level security;
alter table students enable row level security;
alter table classes enable row level security;
alter table referrals enable row level security;

create policy "staff full access" on teachers
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "staff full access" on students
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "staff full access" on classes
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "staff full access" on referrals
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Demo seed data — delete these rows from the Admin tab once you add your real students.
insert into teachers (id, name) values
  ('11111111-1111-1111-1111-111111111111', 'Ustadh Ibrahim Adam'),
  ('22222222-2222-2222-2222-222222222222', 'Ustadha Sara Noor');

insert into classes (day, time, teacher_id, track) values
  ('Sunday', '5:00 PM', '11111111-1111-1111-1111-111111111111', 'Hifz'),
  ('Monday', '6:00 PM', '22222222-2222-2222-2222-222222222222', 'Tajweed'),
  ('Wednesday', '5:00 PM', '11111111-1111-1111-1111-111111111111', 'Hifz'),
  ('Saturday', '10:00 AM', '22222222-2222-2222-2222-222222222222', 'Qaida');

insert into referrals (name, contact, status) values
  ('Bilal family', '+251 91 000 1111', 'Enrolled'),
  ('Hana family', '+251 91 000 2222', 'Invited');

insert into students (name, track, teacher_id, parent_contact, xp, streak, last_active, attendance_log, mistakes_log, memorized) values
(
  'Amina Yusuf', 'Hifz', '11111111-1111-1111-1111-111111111111', '+251 91 111 2222',
  640, 6, '2026-07-13',
  '[true,true,true,false,true,true,true,true]',
  '[{"week":"W1","count":9},{"week":"W2","count":7},{"week":"W3","count":5},{"week":"W4","count":4}]',
  '[{"surah":"An-Naba","nextRevision":"2026-07-13","interval":4},{"surah":"An-Naziat","nextRevision":"2026-07-14","interval":2},{"surah":"Al-Fatiha","nextRevision":"2026-07-20","interval":16}]'
),
(
  'Yusuf Hassan', 'Tajweed', '22222222-2222-2222-2222-222222222222', '+251 91 222 3333',
  280, 2, '2026-07-12',
  '[true,false,true,true,false,true,true,true]',
  '[{"week":"W1","count":14},{"week":"W2","count":12},{"week":"W3","count":10},{"week":"W4","count":9}]',
  '[{"surah":"Al-Ikhlas","nextRevision":"2026-07-12","interval":2},{"surah":"Al-Falaq","nextRevision":"2026-07-14","interval":4}]'
),
(
  'Maryam Ali', 'Hifz', '11111111-1111-1111-1111-111111111111', '+251 91 333 4444',
  910, 14, '2026-07-14',
  '[true,true,true,true,true,true,true,true]',
  '[{"week":"W1","count":6},{"week":"W2","count":4},{"week":"W3","count":3},{"week":"W4","count":2}]',
  '[{"surah":"Al-Mulk","nextRevision":"2026-07-17","interval":8},{"surah":"Ya-Sin","nextRevision":"2026-07-13","interval":4},{"surah":"Ar-Rahman","nextRevision":"2026-07-24","interval":20},{"surah":"Al-Waqiah","nextRevision":"2026-07-14","interval":6}]'
),
(
  'Omar Said', 'Qaida', '22222222-2222-2222-2222-222222222222', '+251 91 444 5555',
  95, 0, '2026-07-09',
  '[true,false,false,true,false,true,false,true]',
  '[{"week":"W1","count":18},{"week":"W2","count":17},{"week":"W3","count":15},{"week":"W4","count":15}]',
  '[{"surah":"Al-Asr","nextRevision":"2026-07-11","interval":1}]'
);
