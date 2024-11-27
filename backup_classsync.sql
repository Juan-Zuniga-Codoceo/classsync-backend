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
-- Name: general_config; Type: TABLE; Schema: public; Owner: classsync
--

CREATE TABLE public.general_config (
    id integer NOT NULL,
    "schoolName" text NOT NULL,
    "schoolYear" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.general_config OWNER TO classsync;

--
-- Name: general_config_id_seq; Type: SEQUENCE; Schema: public; Owner: classsync
--

CREATE SEQUENCE public.general_config_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.general_config_id_seq OWNER TO classsync;

--
-- Name: general_config_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: classsync
--

ALTER SEQUENCE public.general_config_id_seq OWNED BY public.general_config.id;


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
-- Name: teacher_subjects; Type: TABLE; Schema: public; Owner: classsync
--

CREATE TABLE public.teacher_subjects (
    id integer NOT NULL,
    "teacherId" integer NOT NULL,
    "subjectId" integer NOT NULL,
    "courseId" integer,
    level text NOT NULL,
    "isFlexible" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.teacher_subjects OWNER TO classsync;

--
-- Name: teacher_subjects_id_seq; Type: SEQUENCE; Schema: public; Owner: classsync
--

CREATE SEQUENCE public.teacher_subjects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.teacher_subjects_id_seq OWNER TO classsync;

--
-- Name: teacher_subjects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: classsync
--

ALTER SEQUENCE public.teacher_subjects_id_seq OWNED BY public.teacher_subjects.id;


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
-- Name: courses id; Type: DEFAULT; Schema: public; Owner: classsync
--

ALTER TABLE ONLY public.courses ALTER COLUMN id SET DEFAULT nextval('public.courses_id_seq'::regclass);


--
-- Name: general_config id; Type: DEFAULT; Schema: public; Owner: classsync
--

ALTER TABLE ONLY public.general_config ALTER COLUMN id SET DEFAULT nextval('public.general_config_id_seq'::regclass);


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
-- Name: teacher_subjects id; Type: DEFAULT; Schema: public; Owner: classsync
--

ALTER TABLE ONLY public.teacher_subjects ALTER COLUMN id SET DEFAULT nextval('public.teacher_subjects_id_seq'::regclass);


--
-- Name: teachers id; Type: DEFAULT; Schema: public; Owner: classsync
--

ALTER TABLE ONLY public.teachers ALTER COLUMN id SET DEFAULT nextval('public.teachers_id_seq'::regclass);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: classsync
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
a52c4b63-dcdd-4c7c-a782-aaae321aaec2	24b3b282e3ea29e44f4bd966dba9b16bfad76d009dc945fb8092d0f8d1163260	2024-11-14 17:43:25.632582-03	20241114204325_init	\N	\N	2024-11-14 17:43:25.572319-03	1
\.


--
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: classsync
--

COPY public.courses (id, name, level, "createdAt", "updatedAt") FROM stdin;
1	1°B	primary	2024-11-14 21:05:37.14	2024-11-14 21:05:37.14
2	4°C	secondary	2024-11-14 21:05:44.771	2024-11-14 21:05:44.771
4	1°C	primary	2024-11-14 21:06:04.945	2024-11-14 21:06:04.945
5	4°A	secondary	2024-11-14 21:06:17.778	2024-11-14 21:06:17.778
6	4°B	secondary	2024-11-14 21:06:42.981	2024-11-14 21:06:42.981
3	1°A	primary	2024-11-14 21:05:55.098	2024-11-15 15:09:43.1
\.


--
-- Data for Name: general_config; Type: TABLE DATA; Schema: public; Owner: classsync
--

COPY public.general_config (id, "schoolName", "schoolYear", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: schedule_config; Type: TABLE DATA; Schema: public; Owner: classsync
--

COPY public.schedule_config (id, "startTime", "endTime", "blockDuration", "breakDuration", "createdAt", "updatedAt") FROM stdin;
1	2000-01-01 11:00:00	2000-01-01 19:00:00	45	15	2024-11-14 20:44:34.714	2024-11-14 21:19:24.777
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
2	Lenguaje	8	2024-11-14 21:07:28.393	2024-11-15 15:05:11.022
1	Matematicas	8	2024-11-14 21:06:59.874	2024-11-15 15:05:20.501
3	Quimica	6	2024-11-14 21:07:37.713	2024-11-15 15:05:26.316
4	Fisica	6	2024-11-14 21:07:45.545	2024-11-15 15:11:32.041
\.


--
-- Data for Name: teacher_subjects; Type: TABLE DATA; Schema: public; Owner: classsync
--

COPY public.teacher_subjects (id, "teacherId", "subjectId", "courseId", level, "isFlexible", "createdAt", "updatedAt") FROM stdin;
2	1	3	\N	basic	t	2024-11-15 10:35:18.533	2024-11-15 10:35:18.533
3	1	2	\N	basic	t	2024-11-15 10:35:18.533	2024-11-15 10:35:18.533
4	1	1	\N	basic	t	2024-11-15 10:35:18.533	2024-11-15 10:35:18.533
5	1	4	\N	basic	t	2024-11-15 10:35:18.533	2024-11-15 10:35:18.533
6	2	3	\N	middle	t	2024-11-15 10:36:27.489	2024-11-15 10:36:27.489
7	2	1	\N	middle	t	2024-11-15 10:36:27.489	2024-11-15 10:36:27.489
8	2	2	\N	middle	t	2024-11-15 10:36:27.489	2024-11-15 10:36:27.489
9	2	4	\N	middle	t	2024-11-15 10:36:27.489	2024-11-15 10:36:27.489
\.


--
-- Data for Name: teachers; Type: TABLE DATA; Schema: public; Owner: classsync
--

COPY public.teachers (id, "firstName", "lastName", email, phone, "contractType", "totalHours", "createdAt", "updatedAt") FROM stdin;
1	Akane	Zúñiga	akane@gmail.com	+56940413646	full-time	44	2024-11-14 21:19:16.156	2024-11-15 10:35:18.533
2	Jin	jin	jin@gmail.com	+56941413656	full-time	44	2024-11-15 10:36:27.489	2024-11-15 10:36:27.489
\.


--
-- Name: courses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: classsync
--

SELECT pg_catalog.setval('public.courses_id_seq', 6, true);


--
-- Name: general_config_id_seq; Type: SEQUENCE SET; Schema: public; Owner: classsync
--

SELECT pg_catalog.setval('public.general_config_id_seq', 1, false);


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

SELECT pg_catalog.setval('public.subjects_id_seq', 4, true);


--
-- Name: teacher_subjects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: classsync
--

SELECT pg_catalog.setval('public.teacher_subjects_id_seq', 9, true);


--
-- Name: teachers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: classsync
--

SELECT pg_catalog.setval('public.teachers_id_seq', 2, true);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: classsync
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: classsync
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);


--
-- Name: general_config general_config_pkey; Type: CONSTRAINT; Schema: public; Owner: classsync
--

ALTER TABLE ONLY public.general_config
    ADD CONSTRAINT general_config_pkey PRIMARY KEY (id);


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
-- Name: teacher_subjects teacher_subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: classsync
--

ALTER TABLE ONLY public.teacher_subjects
    ADD CONSTRAINT teacher_subjects_pkey PRIMARY KEY (id);


--
-- Name: teachers teachers_pkey; Type: CONSTRAINT; Schema: public; Owner: classsync
--

ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT teachers_pkey PRIMARY KEY (id);


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
-- Name: teacher_subjects_isFlexible_idx; Type: INDEX; Schema: public; Owner: classsync
--

CREATE INDEX "teacher_subjects_isFlexible_idx" ON public.teacher_subjects USING btree ("isFlexible");


--
-- Name: teacher_subjects_level_idx; Type: INDEX; Schema: public; Owner: classsync
--

CREATE INDEX teacher_subjects_level_idx ON public.teacher_subjects USING btree (level);


--
-- Name: teacher_subjects_teacherId_subjectId_courseId_key; Type: INDEX; Schema: public; Owner: classsync
--

CREATE UNIQUE INDEX "teacher_subjects_teacherId_subjectId_courseId_key" ON public.teacher_subjects USING btree ("teacherId", "subjectId", "courseId");


--
-- Name: teachers_email_key; Type: INDEX; Schema: public; Owner: classsync
--

CREATE UNIQUE INDEX teachers_email_key ON public.teachers USING btree (email);


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
-- Name: teacher_subjects teacher_subjects_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: classsync
--

ALTER TABLE ONLY public.teacher_subjects
    ADD CONSTRAINT "teacher_subjects_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public.courses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: teacher_subjects teacher_subjects_subjectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: classsync
--

ALTER TABLE ONLY public.teacher_subjects
    ADD CONSTRAINT "teacher_subjects_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES public.subjects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: teacher_subjects teacher_subjects_teacherId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: classsync
--

ALTER TABLE ONLY public.teacher_subjects
    ADD CONSTRAINT "teacher_subjects_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES public.teachers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: classsync
--

REVOKE ALL ON SCHEMA public FROM classsync;
REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO classsync WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: classsync
--

ALTER DEFAULT PRIVILEGES FOR ROLE classsync IN SCHEMA public GRANT ALL ON SEQUENCES TO classsync;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: classsync
--

ALTER DEFAULT PRIVILEGES FOR ROLE classsync IN SCHEMA public GRANT ALL ON FUNCTIONS TO classsync;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: classsync
--

ALTER DEFAULT PRIVILEGES FOR ROLE classsync IN SCHEMA public GRANT ALL ON TABLES TO classsync;


--
-- PostgreSQL database dump complete
--

