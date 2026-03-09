--
-- PostgreSQL database dump
--

\restrict HCmpS4HozjVFbwkedR0Fa67IUTCbuIDoJM8tsuSYM5uOMJF697QKYl6cnDQmcCF

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

-- Started on 2026-03-06 18:34:59

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
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
-- TOC entry 220 (class 1259 OID 16403)
-- Name: accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.accounts (
    id uuid NOT NULL,
    user_id uuid,
    exchange text NOT NULL,
    name text,
    created_at timestamp without time zone DEFAULT now(),
    "isDefault" boolean DEFAULT false,
    type text DEFAULT 'binance'::text NOT NULL
);


ALTER TABLE public.accounts OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16579)
-- Name: daily_stats; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.daily_stats (
    user_id uuid NOT NULL,
    date date NOT NULL,
    total_trades integer,
    wins integer,
    losses integer,
    pnl numeric(18,8),
    max_drawdown numeric(18,8)
);


ALTER TABLE public.daily_stats OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16521)
-- Name: emotions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.emotions (
    id uuid NOT NULL,
    name text NOT NULL
);


ALTER TABLE public.emotions OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16549)
-- Name: tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tags (
    id uuid NOT NULL,
    user_id uuid,
    name text
);


ALTER TABLE public.tags OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 16532)
-- Name: trade_emotions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trade_emotions (
    trade_id uuid NOT NULL,
    emotion_id uuid NOT NULL
);


ALTER TABLE public.trade_emotions OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16481)
-- Name: trade_setups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trade_setups (
    id uuid NOT NULL,
    user_id uuid,
    name text NOT NULL,
    description text
);


ALTER TABLE public.trade_setups OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 16562)
-- Name: trade_tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trade_tags (
    trade_id uuid NOT NULL,
    tag_id uuid NOT NULL
);


ALTER TABLE public.trade_tags OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16495)
-- Name: trades; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trades (
    id uuid NOT NULL,
    user_id uuid,
    account_id uuid,
    symbol text NOT NULL,
    side text,
    entry_price numeric(18,8),
    exit_price numeric(18,8),
    quantity numeric(18,8),
    pnl numeric(18,8),
    fee numeric(18,8),
    rr numeric(5,2),
    open_time timestamp without time zone,
    close_time timestamp without time zone,
    duration_minutes integer,
    setup_id uuid,
    note text,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT trades_side_check CHECK ((side = ANY (ARRAY['long'::text, 'short'::text])))
);


ALTER TABLE public.trades OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16389)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    plan text DEFAULT 'free'::text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 4978 (class 0 OID 16403)
-- Dependencies: 220
-- Data for Name: accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.accounts (id, user_id, exchange, name, created_at, "isDefault", type) FROM stdin;
\.


--
-- TOC entry 4985 (class 0 OID 16579)
-- Dependencies: 227
-- Data for Name: daily_stats; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.daily_stats (user_id, date, total_trades, wins, losses, pnl, max_drawdown) FROM stdin;
\.


--
-- TOC entry 4981 (class 0 OID 16521)
-- Dependencies: 223
-- Data for Name: emotions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.emotions (id, name) FROM stdin;
\.


--
-- TOC entry 4983 (class 0 OID 16549)
-- Dependencies: 225
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tags (id, user_id, name) FROM stdin;
\.


--
-- TOC entry 4982 (class 0 OID 16532)
-- Dependencies: 224
-- Data for Name: trade_emotions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trade_emotions (trade_id, emotion_id) FROM stdin;
\.


--
-- TOC entry 4979 (class 0 OID 16481)
-- Dependencies: 221
-- Data for Name: trade_setups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trade_setups (id, user_id, name, description) FROM stdin;
\.


--
-- TOC entry 4984 (class 0 OID 16562)
-- Dependencies: 226
-- Data for Name: trade_tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trade_tags (trade_id, tag_id) FROM stdin;
\.


--
-- TOC entry 4980 (class 0 OID 16495)
-- Dependencies: 222
-- Data for Name: trades; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trades (id, user_id, account_id, symbol, side, entry_price, exit_price, quantity, pnl, fee, rr, open_time, close_time, duration_minutes, setup_id, note, created_at) FROM stdin;
\.


--
-- TOC entry 4977 (class 0 OID 16389)
-- Dependencies: 219
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password_hash, plan, created_at, updated_at) FROM stdin;
ce993e26-8fc4-43e0-9405-4dd197f32b40	camtu187zz@gmail.com	$2b$10$7E1t7JBrfFZp6VU5Hq5h3.t6LzCQtS64QVHC3QvgM/gAAD5t6lOvi	free	2025-12-19 08:57:49.092	2025-12-19 15:57:49.092+07
\.


--
-- TOC entry 4798 (class 2606 OID 16412)
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);


--
-- TOC entry 4818 (class 2606 OID 16585)
-- Name: daily_stats daily_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_stats
    ADD CONSTRAINT daily_stats_pkey PRIMARY KEY (user_id, date);


--
-- TOC entry 4808 (class 2606 OID 16531)
-- Name: emotions emotions_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.emotions
    ADD CONSTRAINT emotions_name_key UNIQUE (name);


--
-- TOC entry 4810 (class 2606 OID 16529)
-- Name: emotions emotions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.emotions
    ADD CONSTRAINT emotions_pkey PRIMARY KEY (id);


--
-- TOC entry 4814 (class 2606 OID 16556)
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- TOC entry 4812 (class 2606 OID 16538)
-- Name: trade_emotions trade_emotions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trade_emotions
    ADD CONSTRAINT trade_emotions_pkey PRIMARY KEY (trade_id, emotion_id);


--
-- TOC entry 4800 (class 2606 OID 16489)
-- Name: trade_setups trade_setups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trade_setups
    ADD CONSTRAINT trade_setups_pkey PRIMARY KEY (id);


--
-- TOC entry 4816 (class 2606 OID 16568)
-- Name: trade_tags trade_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trade_tags
    ADD CONSTRAINT trade_tags_pkey PRIMARY KEY (trade_id, tag_id);


--
-- TOC entry 4805 (class 2606 OID 16505)
-- Name: trades trades_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trades
    ADD CONSTRAINT trades_pkey PRIMARY KEY (id);


--
-- TOC entry 4794 (class 2606 OID 16402)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4796 (class 2606 OID 16400)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4801 (class 1259 OID 16593)
-- Name: idx_trades_pnl; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_trades_pnl ON public.trades USING btree (pnl);


--
-- TOC entry 4802 (class 1259 OID 16592)
-- Name: idx_trades_symbol; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_trades_symbol ON public.trades USING btree (symbol);


--
-- TOC entry 4803 (class 1259 OID 16591)
-- Name: idx_trades_user_time; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_trades_user_time ON public.trades USING btree (user_id, open_time);


--
-- TOC entry 4806 (class 1259 OID 16594)
-- Name: uniq_trade_import; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uniq_trade_import ON public.trades USING btree (symbol, side, entry_price, quantity, open_time);


--
-- TOC entry 4819 (class 2606 OID 16413)
-- Name: accounts accounts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 4829 (class 2606 OID 16586)
-- Name: daily_stats daily_stats_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_stats
    ADD CONSTRAINT daily_stats_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 4826 (class 2606 OID 16557)
-- Name: tags tags_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 4824 (class 2606 OID 16544)
-- Name: trade_emotions trade_emotions_emotion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trade_emotions
    ADD CONSTRAINT trade_emotions_emotion_id_fkey FOREIGN KEY (emotion_id) REFERENCES public.emotions(id);


--
-- TOC entry 4825 (class 2606 OID 16539)
-- Name: trade_emotions trade_emotions_trade_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trade_emotions
    ADD CONSTRAINT trade_emotions_trade_id_fkey FOREIGN KEY (trade_id) REFERENCES public.trades(id);


--
-- TOC entry 4820 (class 2606 OID 16490)
-- Name: trade_setups trade_setups_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trade_setups
    ADD CONSTRAINT trade_setups_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 4827 (class 2606 OID 16574)
-- Name: trade_tags trade_tags_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trade_tags
    ADD CONSTRAINT trade_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id);


--
-- TOC entry 4828 (class 2606 OID 16569)
-- Name: trade_tags trade_tags_trade_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trade_tags
    ADD CONSTRAINT trade_tags_trade_id_fkey FOREIGN KEY (trade_id) REFERENCES public.trades(id);


--
-- TOC entry 4821 (class 2606 OID 16511)
-- Name: trades trades_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trades
    ADD CONSTRAINT trades_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id);


--
-- TOC entry 4822 (class 2606 OID 16516)
-- Name: trades trades_setup_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trades
    ADD CONSTRAINT trades_setup_id_fkey FOREIGN KEY (setup_id) REFERENCES public.trade_setups(id);


--
-- TOC entry 4823 (class 2606 OID 16506)
-- Name: trades trades_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trades
    ADD CONSTRAINT trades_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


-- Completed on 2026-03-06 18:35:00

--
-- PostgreSQL database dump complete
--

\unrestrict HCmpS4HozjVFbwkedR0Fa67IUTCbuIDoJM8tsuSYM5uOMJF697QKYl6cnDQmcCF

