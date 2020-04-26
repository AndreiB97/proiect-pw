-- TODO add some faq messages

CREATE DATABASE db;

USE db;

CREATE TABLE QUESTION_POOL (
    QuestionID integer not null primary key auto_increment,
    Answer1 varchar(128) not null,
    Answer2 varchar(128) not null
);

CREATE TABLE USERS (
    UserID integer not null primary key auto_increment,
    Email varchar(64) not null unique,
    Username varchar(32) not null unique,
    Password char(40) not null,
    Strikes integer default 0
);

CREATE TABLE VIEWED_QUESTIONS (
    UserID integer not null,
    QuestionID integer not null,
    Selected_answer integer default 0,
    Score integer default 0,
    Reported integer default 0,

    FOREIGN KEY (UserID) REFERENCES USERS(UserID) ON DELETE CASCADE,
    FOREIGN KEY (QuestionID) REFERENCES QUESTION_POOL(QuestionID) ON DELETE CASCADE
);

CREATE TABLE USER_SUBMITTED_QUESTIONS (
    QuestionID integer not null primary key auto_increment,
    UserID integer not null,
    Answer1 varchar(128) not null,
    Answer2 varchar(128) not null,

    FOREIGN KEY (UserID) REFERENCES USERS(UserID) ON DELETE CASCADE
);

CREATE TABLE ADMINS (
    AdminID integer not null primary key auto_increment,
    Username varchar(32) not null unique,
    Password char(40) not null,
    Role integer not null
);

CREATE TABLE MESSAGES (
    MessageID integer not null primary key auto_increment,
    UserID integer not null,
    AdminID integer,
    Message varchar(512) not null,
    Response varchar(512),
    Flagged_important integer default 0,

    FOREIGN KEY (UserID) REFERENCES USERS(UserID) ON DELETE CASCADE,
    FOREIGN KEY (AdminID) REFERENCES ADMINS(AdminID) ON DELETE CASCADE
);

INSERT INTO ADMINS(Username, Password, Role)
VALUES ('root', SHA1('root'), 1);

INSERT INTO ADMINS(Username, Password, Role)
VALUES ('support', SHA1('root'), 2);

INSERT INTO USERS(Username, Password, Email)
VALUES ('aaaa', SHA1('aaaaaaaa'), 'aaaa@aaaa.a');

INSERT INTO QUESTION_POOL(Answer1, Answer2)
VALUES
(
    "Lead a boring life from here forward",
    "Reborn with all your memories into a baby of the opposite sex."
),
(
    "Reach your ideal salary",
    "Reach your ideal weight"
),
(
    "Overdose on every drug at the same time",
    "Fall off a 100 story building"
),
(
    "Live in Antarctica for a year",
    "Live in Africa for a year"
),
(
    "Be close with only one person, and only see them on Sundays",
    "Know many people and see them every day, but not be particularly close with any"
),
(
    "Have the eyesight of an eagle",
    "Have the sense of smell of a dog"
),
(
    "Take a sandwich tackle from 3 rugby players",
    "Jump off a two story roof"
);

DELIMITER //

CREATE PROCEDURE add_question(IN ans1 varchar(128), IN ans2 varchar(128))
BEGIN
    INSERT INTO QUESTION_POOL(Answer1, Answer2)
    VALUES (ans1, ans2);
END //

CREATE PROCEDURE approve_user_submitted_question(IN id integer)
BEGIN
    DECLARE ans1 varchar(128);
    DECLARE ans2 varchar(128);

    SELECT Answer1, Answer2
    INTO ans1, ans2
    FROM USER_SUBMITTED_QUESTIONS
    WHERE QuestionID = id;

    DELETE FROM USER_SUBMITTED_QUESTIONS
    WHERE QuestionID = id;

    CALL add_question(ans1, ans2);
END //

CREATE PROCEDURE get_random_question()
BEGIN
    SELECT QuestionID, Answer1, Answer2
    FROM QUESTION_POOL
    ORDER BY RAND()
    LIMIT 1;
END //

CREATE PROCEDURE get_random_question_for_user(IN user_id integer)
BEGIN
    SELECT QuestionID, Answer1, Answer2
    FROM QUESTION_POOL
    WHERE QuestionID NOT IN (
            SELECT QuestionID
            FROM VIEWED_QUESTIONS
            WHERE UserID = user_id
        )
    ORDER BY RAND()
    LIMIT 1;
END //

CREATE PROCEDURE add_user_submitted_question(IN user_id integer, IN ans1 varchar(128), IN ans2 varchar(128))
BEGIN
    INSERT INTO USER_SUBMITTED_QUESTIONS(UserID, Answer1, Answer2)
    VALUES (user_id, ans1, ans2);
END //

CREATE PROCEDURE get_user_submitted_questions()
BEGIN
    SELECT q.QuestionID, u.Username, q.Answer1, q.Answer2
    FROM USER_SUBMITTED_QUESTIONS q, USERS u
    WHERE q.UserID = u.UserID;
END //

CREATE PROCEDURE delete_question(IN id integer)
BEGIN
    DELETE FROM QUESTION_POOL
    WHERE QuestionID = id;
END //

CREATE PROCEDURE delete_user_submitted_question(IN id integer)
BEGIN
    DELETE FROM USER_SUBMITTED_QUESTIONS
    WHERE QuestionID = id;
END //

CREATE PROCEDURE view_question(IN user_id integer, IN question_id integer)
BEGIN
    INSERT INTO VIEWED_QUESTIONS(UserID, QuestionID)
    VALUES (user_id, question_id);
END //

CREATE PROCEDURE get_question_stats(IN question_id integer)
BEGIN
    SELECT (
        SELECT COUNT(*)
        FROM VIEWED_QUESTIONS
        WHERE Selected_answer = 1 AND QuestionID = question_id
    ) AS Ans1Count, (
        SELECT COUNT(*)
        FROM VIEWED_QUESTIONS
        WHERE Selected_answer = 2  AND QuestionID = question_id
    ) AS Ans2Count;
END //

CREATE PROCEDURE select_answer(IN user_id integer, IN question_ID integer, IN answer integer)
BEGIN
    UPDATE VIEWED_QUESTIONS
    SET Selected_answer = answer
    WHERE UserID = user_id AND QuestionID = question_id AND Selected_answer = 0;
END //

CREATE PROCEDURE score_question(IN user_id integer, IN question_id integer, IN score_value integer)
BEGIN
    UPDATE VIEWED_QUESTIONS
    SET Score = score_value
    WHERE UserID = user_id AND QuestionID = question_id;
END //

CREATE PROCEDURE add_message(IN user_id integer, IN message varchar(512))
BEGIN
    INSERT INTO MESSAGES(UserID, Message)
    VALUES(user_id, message);
END //

CREATE PROCEDURE report_question(IN user_id integer, IN question_id integer, IN report_value integer)
BEGIN
    UPDATE VIEWED_QUESTIONS
    SET Reported = report_value
    WHERE UserID = user_id AND QuestionID = question_id;
END //

CREATE PROCEDURE get_messages()
BEGIN
    SELECT m.MessageID, u.Username, m.Message, m.Response
    FROM MESSAGES m, USERS u
    WHERE m.UserID = u.UserID;
END //

CREATE PROCEDURE get_message(IN message_id integer)
BEGIN
    SELECT u.Email, m.Message
    FROM MESSAGES m, USERS u
    WHERE m.MessageID = message_id AND u.UserID = m.UserID;
END //

CREATE PROCEDURE get_unanswered_messages()
BEGIN
    SELECT m.MessageID, u.Username, m.Message
    FROM MESSAGES m, USERS u
    WHERE Response IS NULL AND m.UserID = u.UserID;
END //

CREATE PROCEDURE get_user_messages_no_response(IN id integer)
BEGIN
    SELECT m.Message
    FROM MESSAGES m
    WHERE m.UserID = id AND m.Response IS NULL;
END //

CREATE PROCEDURE get_user_messages_with_response(IN id integer)
BEGIN
    SELECT m.Message, a.Username, m.Response
    FROM MESSAGES m, ADMINS a
    WHERE m.AdminID = a.AdminID AND m.UserID = id;
END //

CREATE PROCEDURE respond_to_message(IN message_id integer, IN admin_id integer, IN response varchar(512))
BEGIN
    UPDATE MESSAGES
    SET Response = response, AdminID = admin_id
    WHERE MessageID = message_id;
END //

CREATE PROCEDURE flag_message_important(IN message_id integer, IN flag_value integer)
BEGIN
    UPDATE MESSAGES
    SET Flagged_important = flag_value
    WHERE MessageID = message_id;
END //

CREATE PROCEDURE strike_user(IN user_id integer)
BEGIN
    DECLARE old_strikes integer;

    SELECT Strikes INTO old_strikes
    FROM USERS
    WHERE UserID = user_id;

    IF (old_strikes = 2) THEN
        DELETE FROM USERS
        WHERE UserID = user_id;
    ELSE
        UPDATE USERS
        SET Strikes = old_strikes + 1
        WHERE UserID = user_id;
    END IF;
END;

CREATE PROCEDURE report_message_author(IN message_id integer)
BEGIN
    DECLARE user_id integer;

    SELECT UserID INTO user_id
    FROM MESSAGES
    WHERE MessageID = message_id;

    DELETE FROM MESSAGES
    WHERE MessageID = message_id;

    CALL strike_user(user_id);
END //

CREATE PROCEDURE get_questions_reported_by_users()
BEGIN
    SELECT v.QuestionID, v.UserID, u.Username, p.Answer1, p.Answer2
    FROM QUESTION_POOL p, VIEWED_QUESTIONS v, USERS u
    WHERE p.QuestionID = v.QuestionID AND v.Reported = 1 AND u.UserID = v.UserID;
END //

CREATE PROCEDURE approve_question_report(IN question_id integer)
BEGIN
    CALL delete_question(question_id);
END //

CREATE PROCEDURE strike_question_report_author(IN question_id integer, IN user_id integer)
BEGIN
    UPDATE VIEWED_QUESTIONS
    SET Reported = 0
    WHERE QuestionID = question_id;

    CALL strike_user(user_id);
END //

CREATE PROCEDURE delete_question_report(IN question_id integer, IN user_id integer)
BEGIN
    UPDATE VIEWED_QUESTIONS
    SET Reported = 0
    WHERE QuestionID = question_id AND UserID = user_id;
END //

CREATE PROCEDURE report_user_submitted_question_author(IN question_id integer)
BEGIN
    DECLARE user_id integer;

    SELECT UserID INTO user_id
    FROM USER_SUBMITTED_QUESTIONS
    WHERE QuestionID = question_id;

    DELETE FROM USER_SUBMITTED_QUESTIONS
    WHERE QuestionID = question_id;

    CALL strike_user(user_id);
END //

CREATE PROCEDURE get_flagged_important_messages()
BEGIN
    SELECT m.Message, m.Response
    FROM MESSAGES m
    WHERE m.Response IS NOT NULL AND m.Flagged_important = 1;
END //

CREATE PROCEDURE register_user(IN uname varchar(32), IN pword char(40), IN email varchar(64))
BEGIN
    INSERT INTO USERS(Username, Password, Email)
    VALUES (uname, pword, email);
END //

CREATE PROCEDURE login_user(IN uname varchar(32), IN pword char(40))
BEGIN
    SELECT UserID, Username, Password, Email
    FROM USERS
    WHERE Username = uname AND Password = pword;
END //

CREATE PROCEDURE username_taken(IN uname varchar(32))
BEGIN
    SELECT true
    FROM USERS u, ADMINS a
    WHERE u.Username = uname OR a.Username = uname;
END //

CREATE PROCEDURE email_taken(IN mail varchar(64))
BEGIN
    SELECT true
    FROM USERS u, ADMINS a
    WHERE u.Email = mail;
END //

CREATE PROCEDURE login_admin(IN uname varchar(32), IN pword char(40))
BEGIN
    SELECT AdminID, Username, Password, Role
    FROM ADMINS
    WHERE Username = uname AND Password = pword;
END //

CREATE PROCEDURE register_admin(IN uname varchar(32), IN pword char(40), IN role integer)
BEGIN
    INSERT INTO ADMINS(Username, Password, Role)
    VALUES (uname, pword, role);
END //

DELIMITER ;