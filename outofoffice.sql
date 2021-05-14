--
-- TOC entry 208 (class 1259 OID 32911)
-- Name: outofoffice; Type: TABLE; Schema: public; 
--

CREATE TABLE public.outofoffice (
    user_id character varying(50),
    id integer NOT NULL,
    "from" date,
    "to" date,
    active boolean
);


CREATE SEQUENCE public.outofoffice_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- TOC entry 3032 (class 0 OID 0)
-- Dependencies: 207
-- Name: outofoffice_id_seq; Type: SEQUENCE OWNED BY; Schema: public;
--

ALTER SEQUENCE public.outofoffice_id_seq OWNED BY public.outofoffice.id;

--
-- TOC entry 2878 (class 2604 OID 32914)
-- Name: outofoffice id; Type: DEFAULT; Schema: public; 
--

ALTER TABLE ONLY public.outofoffice ALTER COLUMN id SET DEFAULT nextval('public.outofoffice_id_seq'::regclass);

--
-- TOC entry 2890 (class 2606 OID 32916)
-- Name: outofoffice outofoffice_pkey; Type: CONSTRAINT; Schema: public;
--

ALTER TABLE ONLY public.outofoffice
    ADD CONSTRAINT outofoffice_pkey PRIMARY KEY (id);

--
-- TOC entry 203 (class 1259 OID 32860)
-- Name: projects; Type: TABLE; Schema: public; Owner: postgres
--

--
-- TOC entry 2895 (class 2606 OID 32917)
-- Name: outofoffice user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.outofoffice
    ADD CONSTRAINT user_id FOREIGN KEY (user_id) REFERENCES public.delivery_users(user_id);

--

