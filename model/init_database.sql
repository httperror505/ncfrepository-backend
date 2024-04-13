SHOW DATABASES;

CREATE DATABASE ncfrepository;
USE ncfrepository;


-- TABLES FOR USER MANAGEMENT -- 
CREATE TABLE IF NOT EXISTS role (
	role_id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    role_name VARCHAR (100) NOT NULL
);

INSERT INTO role (role_name)
VALUES 
('Administrator'),
('NCF User'),
('Non-NCF User');

CREATE TABLE IF NOT EXISTS user (
	user_id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    name VARCHAR (100) NOT NULL,
    password VARCHAR (100) NOT NULL,
    email VARCHAR (100) NOT NULL,
    role_id INT NOT NULL,
    CONSTRAINT fk_role_id FOREIGN KEY (role_id) REFERENCES role (role_id)
);

INSERT INTO user (name, password, email, role_id) 
VALUES 
('John Rey Tolosa', 'Password1!', 'jrtolosa@gbox.ncf.edu.ph', 1),
('Arnel Almario', 'Password1!', 'aalmario@gbox.ncf.edu.ph', 1),
('Dont Delete NCF User', 'Password1!', 'test@gbox.ncf.edu.ph', 2),
('Dont Delete Non-NCF User', 'Password1!', 'test@gmail.com', 3);

-- TABLES FOR CONTENT MANAGEMENT --
CREATE TABLE IF NOT EXISTS category (
	category_id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    category_name VARCHAR (100) NOT NULL
); 

INSERT INTO category (category_name)
VALUES 
('Computer'),
('Business'),
('Statistics'),
('Science'),
('Science'),
('Mathematics'),
('Filipino'),
('English'),
('Undefined');

CREATE TABLE IF NOT EXISTS doctype (
	doctype_id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    doctype_name VARCHAR (100) NOT NULL
); 

INSERT INTO doctype (doctype_name)
VALUES 
('PDF'),
('Undefined');

CREATE TABLE IF NOT EXISTS department (
	department_id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    department_name VARCHAR (100) NOT NULL
);

INSERT INTO department (department_name)
VALUES 
('College of Computer Studies'),
('College of Health Sciences'),
('College of Accountancy and Finance'),
('College of Teacher Education'),
('College of Engineering'),
('College of Arts and Sciences'),
('College of Business and Management'),
('College of Criminal Justice Education'),
('Graduate Studies');

CREATE TABLE IF NOT EXISTS course (
	course_id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    course_name VARCHAR (100) NOT NULL,
    department_id INT NOT NULL,
    CONSTRAINT fk_department_id FOREIGN KEY (department_id) REFERENCES department (department_id)
);

INSERT INTO course (course_name, department_id)
VALUES
('Bachelor of Science in Computer Science', 1),
('Bachelor in Public Administration', 7),
('Bachelor of Arts in Communication', 6),
('Bachelor of Arts in English Language Studies', 6),
('Bachelor of Elementary Education', 4),
('Bachelor of Physical Education', 4),
('Bachelor of Science in Accountancy', 3),
('Bachelor of Science in Accounting Information Systems', 3),
('Bachelor of Science in Biology', 4),
('Bachelor of Science in Business Administration Major in Financial Management', 7),
('Bachelor of Science in Business Administration Major in Human Resource Management', 7),
('Bachelor of Science in Business Administration Major in Marketing Management', 7),
('Bachelor of Science in Civil Engineering', 5),
('Bachelor of Science in Computer Engineering', 5),
('Bachelor of Science in Criminology', 8),
('Bachelor of Science in Entrepreneurship', 7),
('Bachelor of Science in Geodetic Engineering', 5),
('Bachelor of Science in Hospitality Management', 7),
('Bachelor of Science in Industrial Security Management', 7),
('Bachelor of Science in Information Systems', 1),
('Bachelor of Science in Mathematics', 4),
('Bachelor of Science in Medical Technology', 2),
('Bachelor of Science in Midwifery', 2),
('Bachelor of Science in Nursing', 2),
('Bachelor of Secondary Education', 4),
('Batsilyer ng Sining sa Filipino', 4),
('Doctor of Philosophy in Criminal Justice with Specialization in Criminology', 9),
('Doctor of Philosophy Major in Educational Management', 9),
('Doctor of Philosophy Major in Human Resource Management', 9),
('Master in Business Administration', 9),
('Master in Public Administration', 9),
('Master of Arts in Education Major in Administration and Supervision', 9),
('Master of Arts in Education Major in Economics', 9),
('Master of Arts in Education Major in Educational Management', 9),
('Master of Arts in Education Major in English', 9),
('Master of Arts in Education Major in Filipino', 9),
('Master of Arts in Education Major in Mathematics', 9),
('Master of Arts in Education Major in Physical Education', 9),
('Master of Arts in Education Major in Science', 9),
('Master of Science in Criminology', 9);


CREATE TABLE IF NOT EXISTS document (
    document_id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(100) NOT NULL,
    publish_date DATE NOT NULL,
    abstract VARCHAR(2000) NOT NULL,
    citation VARCHAR(255) NOT NULL,
    category_id INT NOT NULL,
    doctype_id INT NOT NULL,
    department_id INT NOT NULL,
    course_id INT NOT NULL,
    status_id BOOLEAN DEFAULT TRUE NOT NULL,
    CONSTRAINT fk_category_id_document FOREIGN KEY (category_id) REFERENCES category (category_id),
    CONSTRAINT fk_doctype_id_document FOREIGN KEY (doctype_id) REFERENCES doctype (doctype_id),
    CONSTRAINT fk_department_id_document FOREIGN KEY (department_id) REFERENCES department (department_id),
    CONSTRAINT fk_course_id_document FOREIGN KEY (course_id) REFERENCES course (course_id)
);


INSERT INTO document (title, author, publish_date, abstract, citation, category_id, doctype_id, department_id, course_id)
VALUES
('Augmented Reality for Teaching Anatomy', 'Mj Estepanie Palo', '2025-01-01', 'Augmented Reality for Teaching Anatomy is a Lorem Ipsum', 'Palo, M., (2025), Augmented Reality for Teaching Anatomy, Naga College Foundation', 1, 1, 1, 1),
('CodeDap: A Code Plagiarism Detection Tool', 'Jeffrey Agdoro', '2025-01-01', 'CodeDap: A Code Plagiarism Detection Tool is a Lorem Ipsum ', 'Agdoro, J., (2025), CodeDap: A Code Plagiarism Detection Tool', 1, 1, 1, 1),
('Augmented Reality for Historical Landmarks in Naga City', 'Gracia Villanueva', '2025-01-01', 'Augmented Reality for Historical Landmarks in Naga City is a Lorem Ipsum ', 'Villanueva, G., (2025), Augmented Reality for Historical Landmarks in Naga City, Naga College Foundation', 1, 1, 1, 1);
	
INSERT INTO document (title, author, publish_date, abstract, citation, category_id, doctype_id, department_id, course_id)
VALUES
('Pyclonix: Python Code Plagiarism Checker using Token String', 'Allan Oliver Polliente', '2025-01-01', 'Pyclonix: Python Code Plagiarism Checker using Token String is a Lorem Ipsum', 'Polliente, A., (2025), Pyclonix: Python Code Plagiarism Checker using Token String, Naga College Foundation', 1, 1, 1, 1),
('Codefy: Learn Code using Game', 'codefycs.org', '2025-01-01', 'Codefy: Learn Code using Game is a Lorem Ipsum ', 'Unknown Author, (2025), Codefy: Learn Code using Game', 1, 1, 1, 1),
('Currency Identify using Computer Vision and Artificial Intelligence', 'Jhamel Mamasao', '2025-01-01', 'Currency Identify using Computer Vision and Artificial Intelligence is a Lorem Ipsum ', 'Mamasao, J., (2025), Currency Identify using Computer Vision and Artificial Intelligence, Naga College Foundation', 1, 1, 1, 1),
('Understanding the behavioral intention to adopt business intelligence and analytics by Philippine MSMEs', 'Ronel Simon', '2022-04-01', 'Understanding the behavioral intention to adopt business intelligence and analytics by Philippine MSMEs is a Lorem Ipsum ', 'Simon, R., (2025), Codefy: Learn Code using Game', 2, 1, 8, 1),
('Understanding Population Downfall using Computational Logics', 'John Doe', '2021-01-01', 'Understanding Population Downfall using Computational Logics', 'Doe, J., (2025), Understanding Population Downfall using Computational Logics', 3, 1, 5, 21),
('Utilization of Dispositioning Molecular Structure of Higgs Boson in Light Emmission', 'Jane Doe', '2021-01-01', 'Understanding Population Downfall using Computational Logics', 'Doe. J, (2025),Understanding Population Downfall using Computational Logics', 4, 1, 4, 9);
    
SELECT * FROM document;

SELECT
    d.document_id,
    d.title,
    d.author,
    d.publish_date,
    d.abstract,
    d.citation,
    c.category_name,
    dt.doctype_name,
    dep.department_name,
    co.course_name
FROM
    document d
JOIN
    category c ON d.category_id = c.category_id
JOIN
    doctype dt ON d.doctype_id = dt.doctype_id
JOIN
    department dep ON d.department_id = dep.department_id
JOIN
    course co ON d.course_id = co.course_id;