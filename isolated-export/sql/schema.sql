-- Create Database for Book List Application
CREATE DATABASE BookListDb;
GO

USE BookListDb;
GO

-- 1. Create Users Table (Authenticated via Mobile Number)
CREATE TABLE Users (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Username NVARCHAR(100) NOT NULL,
    MobileNumber NVARCHAR(20) NOT NULL UNIQUE,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- 2. Create Books Table
CREATE TABLE Books (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Title NVARCHAR(200) NOT NULL,
    Author NVARCHAR(200) NOT NULL,
    CoverUrl NVARCHAR(500) NULL,
    Rating INT NOT NULL CHECK (Rating >= 1 AND Rating <= 5),
    Language NVARCHAR(50) NOT NULL DEFAULT 'English',
    Genre NVARCHAR(100) NOT NULL,
    Popularity INT NOT NULL DEFAULT 50,
    Description NVARCHAR(MAX) NULL,
    DownloadCount INT NOT NULL DEFAULT 0
);

-- 3. Insert Initial Books matching the ManyBooks Layout Mock
INSERT INTO Books (Id, Title, Author, CoverUrl, Rating, Language, Genre, Popularity, Description, DownloadCount)
VALUES 
(NEWID(), 'A Convenient Risk', 'Sara R Turnquist', 'linear-gradient(135deg, #df8d71 0%, #aa4b3b 100%)', 5, 'English', 'Romance', 98, 'When love is game, can you find it again? A thrilling tale of historical romance.', 1420),
(NEWID(), 'War Of The Animals', 'Jonathan Decoteau', 'linear-gradient(135deg, #1f2937 0%, #111827 100%)', 4, 'English', 'Science Fiction', 89, 'Book 1: The Shut Face Of Thunder. Nature fights back!', 1105),
(NEWID(), 'Dirt Dealers', 'A.W. Kaylen', 'linear-gradient(135deg, #b45309 0%, #78350f 100%)', 4, 'English', 'Mystery & Thriller', 95, 'Heather Chase FBI Series. Investigative mystery.', 890),
(NEWID(), 'Lost to You', 'A.L. Jackson', 'linear-gradient(135deg, #fda4af 0%, #e11d48 100%)', 5, 'English', 'Romance', 92, 'A regret novel of passionate love and second chances.', 2310);
