DROP TABLE IF EXISTS table1;

CREATE TABLE table1(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    house VARCHAR(255),
    patronus VARCHAR(255),
    image VARCHAR(255),
    alive boolean NOT NULL DEFAULT true,
    created_by VARCHAR(255)
);