export const DOTNET_CONTROLLER_TEMPLATE = `using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace BookListApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BooksController : ControllerBase
    {
        private readonly AppDbContext _context;

        public BooksController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/books
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Book>>> GetBooks()
        {
            return await _context.Books.ToListAsync();
        }

        // GET: api/books/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Book>> GetBook(Guid id)
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null) return NotFound();
            return book;
        }

        // POST: api/books
        [HttpPost]
        public async Task<ActionResult<Book>> PostBook(Book book)
        {
            if (book.Id == Guid.Empty) book.Id = Guid.NewGuid();
            _context.Books.Add(book);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetBook), new { id = book.Id }, book);
        }

        // PUT: api/books/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutBook(Guid id, Book book)
        {
            if (id != book.Id) return BadRequest();
            _context.Entry(book).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!BookExists(id)) return NotFound();
                throw;
            }
            return NoContent();
        }

        // DELETE: api/books/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBook(Guid id)
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null) return NotFound();
            _context.Books.Remove(book);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private bool BookExists(Guid id)
        {
            return _context.Books.Any(e => e.Id == id);
        }
    }
}`;

export const DOTNET_AUTH_TEMPLATE = `using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BookListApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AuthController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("signup")]
        public async Task<IActionResult> Signup([FromBody] SignupDto dto)
        {
            if (string.IsNullOrEmpty(dto.MobileNumber) || string.IsNullOrEmpty(dto.Username))
            {
                return BadRequest("Username and Mobile Number are required.");
            }

            var exists = await _context.Users.AnyAsync(u => u.MobileNumber == dto.MobileNumber);
            if (exists) return BadRequest("Mobile number is already registered.");

            var newUser = new User
            {
                Id = Guid.NewGuid(),
                Username = dto.Username,
                MobileNumber = dto.MobileNumber,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            return Ok(new { username = newUser.Username, mobileNumber = newUser.MobileNumber });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.MobileNumber == dto.MobileNumber);
            if (user == null) return NotFound("User with this mobile number does not exist.");
            return Ok(new { username = user.Username, mobileNumber = user.MobileNumber });
        }
    }

    public class SignupDto { public string Username { get; set; } public string MobileNumber { get; set; } }
    public class LoginDto { public string MobileNumber { get; set; } }
}`;

export const SQL_SERVER_SCHEMA = `-- Create Database for Book List Application
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
`;

export const DOTNET_DB_CONTEXT = `using Microsoft.EntityFrameworkCore;

namespace BookListApp
{
    public class Book
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Author { get; set; }
        public string CoverUrl { get; set; }
        public int Rating { get; set; }
        public string Language { get; set; }
        public string Genre { get; set; }
        public int Popularity { get; set; }
        public string Description { get; set; }
        public int DownloadCount { get; set; }
    }

    public class User
    {
        public Guid Id { get; set; }
        public string Username { get; set; }
        public string MobileNumber { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Book> Books { get; set; }
        public DbSet<User> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>().HasIndex(u => u.MobileNumber).IsUnique();
        }
    }
}`;
