INSERT INTO department (id, deparment_name)
VALUES
(1, 'Engineering'),
(2, 'Sales'),
(3, 'Finance'),
(4, 'Legal'),
(5, 'HR');

INSERT INTO roles (id, title, salary, department_id)
VALUES
(1, 'Software Engineer', 100000, 1),
(2, 'Sales Lead', 80000, 2),
(3, 'Accountant', 75000, 3),
(4, 'Legal Team Lead', 250000, 4),
(5, 'HR Director', 150000, 5);

INSERT INTO employee (id, first_name, last_name, roles_id, manager_id)
VALUES
(1, 'Jered', 'Brunson', 1, NULL),
(2, 'Brendan', 'Linehand', 2, 1),
(3, 'Alex', 'Moore', 3, 2),
(4, 'Charlie', 'Brown', 4, 3),
(5, 'Karen', 'Johnson', 5, 4),
(6, 'John', 'Doe', 1, 1),
(7, 'Jane', 'Doe', 2, 2),
(8, 'Jim', 'Smith', 3, 3),
(9, 'Jill', 'Smith', 4, 4),
(10, 'Jack', 'Johnson', 5, 5);

