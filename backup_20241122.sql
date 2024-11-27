--
-- PostgreSQL database dump
--

-- Dumped from database version 16.3
-- Dumped by pg_dump version 16.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: classsync
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO classsync;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: classsync
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: classsync
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO classsync;

--
-- Name: course_subjects; Type: TABLE; Schema: public; Owner: classsync
--

CREATE TABLE public.course_subjects (
    id integer NOT NULL,
    "subjectId" integer NOT NULL,
    "courseId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.course_subjects OWNER TO classsync;

--
-- Name: course_subjects_id_seq; Type: SEQUENCE; Schema: public; Owner: classsync
--

CREATE SEQUENCE public.course_subjects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.course_subjects_id_seq OWNER TO classsync;

--
-- Name: course_subjects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: classsync
--

ALTER SEQUENCE public.course_subjects_id_seq OWNED BY public.course_subjects.id;


--
-- Name: courses; Type: TABLE; Schema: public; Owner: classsync
--

CREATE TABLE public.courses (
    id integer NOT NULL,
    name text NOT NULL,
    level text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.courses OWNER TO classsync;

--
-- Name: courses_id_seq; Type: SEQUENCE; Schema: public; Owner: classsync
--

CREATE SEQUENCE public.courses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.courses_id_seq OWNER TO classsync;

--
-- Name: courses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: classsync
--

ALTER SEQUENCE public.courses_id_seq OWNED BY public.courses.id;


--
-- Name: schedule_config; Type: TABLE; Schema: public; Owner: classsync
--

CREATE TABLE public.schedule_config (
    id integer NOT NULL,
    "startTime" timestamp(3) without time zone NOT NULL,
    "endTime" timestamp(3) without time zone NOT NULL,
    "blockDuration" integer NOT NULL,
    "breakDuration" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.schedule_config OWNER TO classsync;

--
-- Name: schedule_config_id_seq; Type: SEQUENCE; Schema: public; Owner: classsync
--

CREATE SEQUENCE public.schedule_config_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.schedule_config_id_seq OWNER TO classsync;

--
-- Name: schedule_config_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: classsync
--

ALTER SEQUENCE public.schedule_config_id_seq OWNED BY public.schedule_config.id;


--
-- Name: schedules; Type: TABLE; Schema: public; Owner: classsync
--

CREATE TABLE public.schedules (
    id integer NOT NULL,
    "teacherId" integer NOT NULL,
    "subjectId" integer NOT NULL,
    "courseId" integer NOT NULL,
    "dayOfWeek" integer NOT NULL,
    "blockNumber" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.schedules OWNER TO classsync;

--
-- Name: schedules_id_seq; Type: SEQUENCE; Schema: public; Owner: classsync
--

CREATE SEQUENCE public.schedules_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.schedules_id_seq OWNER TO classsync;

--
-- Name: schedules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: classsync
--

ALTER SEQUENCE public.schedules_id_seq OWNED BY public.schedules.id;


--
-- Name: subjects; Type: TABLE; Schema: public; Owner: classsync
--

CREATE TABLE public.subjects (
    id integer NOT NULL,
    name text NOT NULL,
    "hoursPerWeek" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.subjects OWNER TO classsync;

--
-- Name: subjects_id_seq; Type: SEQUENCE; Schema: public; Owner: classsync
--

CREATE SEQUENCE public.subjects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.subjects_id_seq OWNER TO classsync;

--
-- Name: subjects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: classsync
--

ALTER SEQUENCE public.subjects_id_seq OWNED BY public.subjects.id;


--
-- Name: teacher_assignments; Type: TABLE; Schema: public; Owner: classsync
--

CREATE TABLE public.teacher_assignments (
    id integer NOT NULL,
    "teacherId" integer NOT NULL,
    "subjectId" integer NOT NULL,
    "courseId" integer NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "startDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "endDate" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.teacher_assignments OWNER TO classsync;

--
-- Name: teacher_assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: classsync
--

CREATE SEQUENCE public.teacher_assignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.teacher_assignments_id_seq OWNER TO classsync;

--
-- Name: teacher_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: classsync
--

ALTER SEQUENCE public.teacher_assignments_id_seq OWNED BY public.teacher_assignments.id;


--
-- Name: teachers; Type: TABLE; Schema: public; Owner: classsync
--

CREATE TABLE public.teachers (
    id integer NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    email text NOT NULL,
    phone text,
    "contractType" text NOT NULL,
    "totalHours" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.teachers OWNER TO classsync;

--
-- Name: teachers_id_seq; Type: SEQUENCE; Schema: public; Owner: classsync
--

CREATE SEQUENCE public.teachers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.teachers_id_seq OWNER TO classsync;

--
-- Name: teachers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: classsync
--

ALTER SEQUENCE public.teachers_id_seq OWNED BY public.teachers.id;


--
-- Name: course_subjects id; Type: DEFAULT; Schema: public; Owner: classsync
--

ALTER TABLE ONLY public.course_subjects ALTER COLUMN id SET DEFAULT nextval('public.course_subjects_id_seq'::regclass);


--
-- Name: courses id; Type: DEFAULT; Schema: public; Owner: classsync
--

ALTER TABLE ONLY public.courses ALTER COLUMN id SET DEFAULT nextval('public.courses_id_seq'::regclass);


--
-- Name: schedule_config id; Type: DEFAULT; Schema: public; Owner: classsync
--

ALTER TABLE ONLY public.schedule_config ALTER COLUMN id SET DEFAULT nextval('public.schedule_config_id_seq'::regclass);


--
-- Name: schedules id; Type: DEFAULT; Schema: public; Owner: classsync
--

ALTER TABLE ONLY public.schedules ALTER COLUMN id SET DEFAULT nextval('public.schedules_id_seq'::regclass);


--
-- Name: subjects id; Type: DEFAULT; Schema: public; Owner: classsync
--

ALTER TABLE ONLY public.subjects ALTER COLUMN id SET DEFAULT nextval('public.subjects_id_seq'::regclass);


--
-- Name: teacher_assignments id; Type: DEFAULT; Schema: public; Owner: classsync
--

ALTER TABLE ONLY public.teacher_assignments ALTER COLUMN id SET DEFAULT nextval('public.teacher_assignments_id_seq'::regclass);


--
-- Name: teachers id; Type: DEFAULT; Schema: public; Owner: classsync
--

ALTER TABLE ONLY public.teachers ALTER COLUMN id SET DEFAULT nextval('public.teachers_id_seq'::regclass);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: classsync
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
d1971128-4ba2-44b8-83d3-b4e957b640ca	24b3b282e3ea29e44f4bd966dba9b16bfad76d009dc945fb8092d0f8d1163260	2024-11-15 12:32:48.875658-03	20241114204325_init	\N	\N	2024-11-15 12:32:48.834561-03	1
cc3664d2-bf69-4f5b-8e7e-fa070b2a5c29	5ca70680989083ed0b69e80ee6ed5f1851a6610a2cdfd235ddf7f434c4531a52	2024-11-15 12:32:48.907797-03	20241115152820_restructure_course_subject_relations	\N	\N	2024-11-15 12:32:48.877515-03	1
\.


--
-- Data for Name: course_subjects; Type: TABLE DATA; Schema: public; Owner: classsync
--

COPY public.course_subjects (id, "subjectId", "courseId", "createdAt", "updatedAt") FROM stdin;
4	1	1	2024-11-22 10:21:10.351	2024-11-22 10:21:10.351
5	1	3	2024-11-22 10:21:10.351	2024-11-22 10:21:10.351
\.


--
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: classsync
--

COPY public.courses (id, name, level, "createdAt", "updatedAt") FROM stdin;
3	1°B	secondary	2024-11-15 15:47:15.748	2024-11-15 15:47:15.748
1	1°B	primary	2024-11-15 15:35:09.63	2024-11-22 10:21:00.621
\.


--
-- Data for Name: schedule_config; Type: TABLE DATA; Schema: public; Owner: classsync
--

COPY public.schedule_config (id, "startTime", "endTime", "blockDuration", "breakDuration", "createdAt", "updatedAt") FROM stdin;
1	2000-01-01 11:00:00	2000-01-01 19:00:00	45	15	2024-11-15 20:28:46.239	2024-11-15 20:28:46.239
\.


--
-- Data for Name: schedules; Type: TABLE DATA; Schema: public; Owner: classsync
--

COPY public.schedules (id, "teacherId", "subjectId", "courseId", "dayOfWeek", "blockNumber", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: subjects; Type: TABLE DATA; Schema: public; Owner: classsync
--

COPY public.subjects (id, name, "hoursPerWeek", "createdAt", "updatedAt") FROM stdin;
1	Matematicas	12	2024-11-15 15:43:30.879	2024-11-22 10:21:10.342
\.


--
-- Data for Name: teacher_assignments; Type: TABLE DATA; Schema: public; Owner: classsync
--

COPY public.teacher_assignments (id, "teacherId", "subjectId", "courseId", "isActive", "startDate", "endDate", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: teachers; Type: TABLE DATA; Schema: public; Owner: classsync
--

COPY public.teachers (id, "firstName", "lastName", email, phone, "contractType", "totalHours", "createdAt", "updatedAt") FROM stdin;
1	Akane	Zúñiga	akane@gmail.com	+56940413646	full-time	44	2024-11-19 10:22:17.998	2024-11-19 10:22:17.998
\.


--
-- Name: course_subjects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: classsync
--

SELECT pg_catalog.setval('public.course_subjects_id_seq', 5, true);


--
-- Name: courses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: classsync
--

SELECT pg_catalog.setval('public.courses_id_seq', 3, true);


--
-- Name: schedule_config_id_seq; Type: SEQUENCE SET; Schema: public; Owner: classsync
--

SELECT pg_catalog.setval('public.schedule_config_id_seq', 1, true);


--
-- Name: schedules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: classsync
--

SELECT pg_catalog.setval('public.schedules_id_seq', 1, false);


--
-- Name: subjects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: classsync
--

SELECT pg_catalog.setval('public.subjects_id_seq', 1, true);


--
-- Name: teacher_assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: classsync
--

SELECT pg_catalog.setval('public.teacher_assignments_id_seq', 1, false);


--
-- Name: teachers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: classsync
--

SELECT pg_catalog.setval('public.teachers_id_seq', 1, true);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: classsync
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: course_subjects course_subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: classsync
--

ALTER TABLE ONLY public.course_subjects
    ADD CONSTRAINT course_subjects_pkey PRIMARY KEY (id);


--
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: classsync
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);


--
-- Name: schedule_config schedule_config_pkey; Type: CONSTRAINT; Schema: public; Owner: classsync
--

ALTER TABLE ONLY public.schedule_config
    ADD CONSTRAINT schedule_config_pkey PRIMARY KEY (id);


--
-- Name: schedules schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: classsync
--

ALTER TABLE ONLY public.schedules
    ADD CONSTRAINT schedules_pkey PRIMARY KEY (id);


--
-- Name: subjects subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: classsync
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_pkey PRIMARY KEY (id);


--
-- Name: teacher_assignments teacher_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: classsync
--

ALTER TABLE ONLY public.teacher_assignments
    ADD CONSTRAINT teacher_assignments_pkey PRIMARY KEY (id);


--
-- Name: teachers teachers_pkey; Type: CONSTRAINT; Schema: public; Owner: classsync
--

ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT teachers_pkey PRIMARY KEY (id);


--
-- Name: course_subjects_courseId_subjectId_key; Type: INDEX; Schema: public; Owner: classsync
--

CREATE UNIQUE INDEX "course_subjects_courseId_subjectId_key" ON public.course_subjects USING btree ("courseId", "subjectId");


--
-- Name: schedules_courseId_dayOfWeek_blockNumber_key; Type: INDEX; Schema: public; Owner: classsync
--

CREATE UNIQUE INDEX "schedules_courseId_dayOfWeek_blockNumber_key" ON public.schedules USING btree ("courseId", "dayOfWeek", "blockNumber");


--
-- Name: schedules_teacherId_dayOfWeek_blockNumber_key; Type: INDEX; Schema: public; Owner: classsync
--

CREATE UNIQUE INDEX "schedules_teacherId_dayOfWeek_blockNumber_key" ON public.schedules USING btree ("teacherId", "dayOfWeek", "blockNumber");


--
-- Name: subjects_name_key; Type: INDEX; Schema: public; Owner: classsync
--

CREATE UNIQUE INDEX subjects_name_key ON public.subjects USING btree (name);


--
-- Name: teacher_assignments_teacherId_subjectId_courseId_isActive_key; Type: INDEX; Schema: public; Owner: classsync
--

CREATE UNIQUE INDEX "teacher_assignments_teacherId_subjectId_courseId_isActive_key" ON public.teacher_assignments USING btree ("teacherId", "subjectId", "courseId", "isActive");


--
-- Name: teachers_email_key; Type: INDEX; Schema: public; Owner: classsync
--

CREATE UNIQUE INDEX teachers_email_key ON public.teachers USING btree (email);


--
-- Name: course_subjects course_subjects_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: classsync
--

ALTER TABLE ONLY public.course_subjects
    ADD CONSTRAINT "course_subjects_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public.courses(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: course_subjects course_subjects_subjectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: classsync
--

ALTER TABLE ONLY public.course_subjects
    ADD CONSTRAINT "course_subjects_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES public.subjects(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: schedules schedules_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: classsync
--

ALTER TABLE ONLY public.schedules
    ADD CONSTRAINT "schedules_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public.courses(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: schedules schedules_subjectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: classsync
--

ALTER TABLE ONLY public.schedules
    ADD CONSTRAINT "schedules_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES public.subjects(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: schedules schedules_teacherId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: classsync
--

ALTER TABLE ONLY public.schedules
    ADD CONSTRAINT "schedules_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES public.teachers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: teacher_assignments teacher_assignments_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: classsync
--

ALTER TABLE ONLY public.teacher_assignments
    ADD CONSTRAINT "teacher_assignments_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public.courses(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: teacher_assignments teacher_assignments_subjectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: classsync
--

ALTER TABLE ONLY public.teacher_assignments
    ADD CONSTRAINT "teacher_assignments_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES public.subjects(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: teacher_assignments teacher_assignments_teacherId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: classsync
--

ALTER TABLE ONLY public.teacher_assignments
    ADD CONSTRAINT "teacher_assignments_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES public.teachers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: classsync
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

