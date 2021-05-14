--
-- PostgreSQL database dump
--

-- Dumped from database version 13.2
-- Dumped by pg_dump version 13.2

-- Started on 2021-04-30 10:21:25

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 200 (class 1259 OID 24596)
-- Name: delivery_users; Type: TABLE; Schema: public; 
--

CREATE TABLE public.delivery_users (
    username character varying(50) NOT NULL,
    timezone character varying(50) NOT NULL,
    user_id character varying(50) NOT NULL,
    active boolean
);

--
-- TOC entry 206 (class 1259 OID 24652)
-- Name: delivery_users_projects; Type: TABLE; Schema: public; 
--

CREATE TABLE public.delivery_users_projects (
    id integer NOT NULL,
    user_id character varying(50),
    project_id integer,
    active boolean,
    date_assigned text,
    date_unassigned text
);

--
-- TOC entry 205 (class 1259 OID 24650)
-- Name: delivery_users_projects_id_seq; Type: SEQUENCE; Schema: public;
--

CREATE SEQUENCE public.delivery_users_projects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- TOC entry 3021 (class 0 OID 0)
-- Dependencies: 205
-- Name: delivery_users_projects_id_seq; Type: SEQUENCE OWNED BY; Schema: public;
--

ALTER SEQUENCE public.delivery_users_projects_id_seq OWNED BY public.delivery_users_projects.id;


--
-- TOC entry 202 (class 1259 OID 24603)
-- Name: projects; Type: TABLE; Schema: public;
--

CREATE TABLE public.projects (
    id integer NOT NULL,
    projectname text NOT NULL,
    active boolean
);

--
-- TOC entry 201 (class 1259 OID 24601)
-- Name: projects_id_seq; Type: SEQUENCE; Schema: public; 
--

CREATE SEQUENCE public.projects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- TOC entry 3022 (class 0 OID 0)
-- Dependencies: 201
-- Name: projects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; 
--

ALTER SEQUENCE public.projects_id_seq OWNED BY public.projects.id;


--
-- TOC entry 204 (class 1259 OID 24629)
-- Name: projectsurvey; Type: TABLE; Schema: public; 
--

CREATE TABLE public.projectsurvey (
    id integer NOT NULL,
    user_id character varying(50) NOT NULL,
    project_id integer NOT NULL,
    rating text NOT NULL,
    comment text,
    posteddate text NOT NULL
);



--
-- TOC entry 203 (class 1259 OID 24627)
-- Name: projectsurvey_id_seq; Type: SEQUENCE; Schema: public; 
--

CREATE SEQUENCE public.projectsurvey_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- TOC entry 3023 (class 0 OID 0)
-- Dependencies: 203
-- Name: projectsurvey_id_seq; Type: SEQUENCE OWNED BY; Schema: public;
--

ALTER SEQUENCE public.projectsurvey_id_seq OWNED BY public.projectsurvey.id;


--
-- TOC entry 2871 (class 2604 OID 24655)
-- Name: delivery_users_projects id; Type: DEFAULT; Schema: public;
--

ALTER TABLE ONLY public.delivery_users_projects ALTER COLUMN id SET DEFAULT nextval('public.delivery_users_projects_id_seq'::regclass);


--
-- TOC entry 2869 (class 2604 OID 24606)
-- Name: projects id; Type: DEFAULT; Schema: public;
--

ALTER TABLE ONLY public.projects ALTER COLUMN id SET DEFAULT nextval('public.projects_id_seq'::regclass);


--
-- TOC entry 2870 (class 2604 OID 24632)
-- Name: projectsurvey id; Type: DEFAULT; Schema: public;
--

ALTER TABLE ONLY public.projectsurvey ALTER COLUMN id SET DEFAULT nextval('public.projectsurvey_id_seq'::regclass);


--
-- TOC entry 2873 (class 2606 OID 24600)
-- Name: delivery_users delivery_users_pkey; Type: CONSTRAINT; Schema: public; 
--

ALTER TABLE ONLY public.delivery_users
    ADD CONSTRAINT delivery_users_pkey PRIMARY KEY (user_id);


--
-- TOC entry 2881 (class 2606 OID 24660)
-- Name: delivery_users_projects delivery_users_projects_pkey; Type: CONSTRAINT; Schema: public;
--

ALTER TABLE ONLY public.delivery_users_projects
    ADD CONSTRAINT delivery_users_projects_pkey PRIMARY KEY (id);


--
-- TOC entry 2875 (class 2606 OID 24611)
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public;
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- TOC entry 2877 (class 2606 OID 24649)
-- Name: projects projects_projectname_key; Type: CONSTRAINT; Schema: public;
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_projectname_key UNIQUE (projectname);


--
-- TOC entry 2879 (class 2606 OID 24637)
-- Name: projectsurvey projectsurvey_pkey; Type: CONSTRAINT; Schema: public;
--

ALTER TABLE ONLY public.projectsurvey
    ADD CONSTRAINT projectsurvey_pkey PRIMARY KEY (id);


--
-- TOC entry 2883 (class 2606 OID 24643)
-- Name: projectsurvey project_id; Type: FK CONSTRAINT; Schema: public; 
--

ALTER TABLE ONLY public.projectsurvey
    ADD CONSTRAINT project_id FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- TOC entry 2885 (class 2606 OID 24666)
-- Name: delivery_users_projects project_id; Type: FK CONSTRAINT; Schema: public; 
--

ALTER TABLE ONLY public.delivery_users_projects
    ADD CONSTRAINT project_id FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- TOC entry 2882 (class 2606 OID 24638)
-- Name: projectsurvey user_id; Type: FK CONSTRAINT; Schema: public; 
--

ALTER TABLE ONLY public.projectsurvey
    ADD CONSTRAINT user_id FOREIGN KEY (user_id) REFERENCES public.delivery_users(user_id);


--
-- TOC entry 2884 (class 2606 OID 24661)
-- Name: delivery_users_projects user_id; Type: FK CONSTRAINT; Schema: public;
--

ALTER TABLE ONLY public.delivery_users_projects
    ADD CONSTRAINT user_id FOREIGN KEY (user_id) REFERENCES public.delivery_users(user_id);


-- Completed on 2021-04-30 10:21:27

--
-- PostgreSQL database dump complete
--

