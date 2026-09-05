using Microsoft.EntityFrameworkCore;
using BookListApp.Models;

namespace BookListApp.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Book> Books { get; set; } = null!;
        public DbSet<User> Users { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure MobileNumber as Unique Index
            modelBuilder.Entity<User>()
                .HasIndex(u => u.MobileNumber)
                .IsUnique();

            // Seed initial books matching layout mock
            modelBuilder.Entity<Book>().HasData(
                new Book
                {
                    Id = Guid.NewGuid(),
                    Title = "A Convenient Risk",
                    Author = "Sara R Turnquist",
                    CoverUrl = "linear-gradient(135deg, #df8d71 0%, #aa4b3b 100%)",
                    Rating = 5,
                    Genre = "Romance",
                    Popularity = 98,
                    Description = "When love is game, can you find it again? A thrilling tale of historical romance.",
                    DownloadCount = 1420
                },
                new Book
                {
                    Id = Guid.NewGuid(),
                    Title = "War Of The Animals",
                    Author = "Jonathan Decoteau",
                    CoverUrl = "linear-gradient(135deg, #1f2937 0%, #111827 100%)",
                    Rating = 4,
                    Genre = "Science Fiction",
                    Popularity = 89,
                    Description = "Book 1: The Shut Face Of Thunder. Nature fights back!",
                    DownloadCount = 1105
                },
                new Book
                {
                    Id = Guid.NewGuid(),
                    Title = "Dirt Dealers",
                    Author = "A.W. Kaylen",
                    CoverUrl = "linear-gradient(135deg, #b45309 0%, #78350f 100%)",
                    Rating = 4,
                    Genre = "Mystery & Thriller",
                    Popularity = 95,
                    Description = "Heather Chase FBI Series. Investigative mystery.",
                    DownloadCount = 890
                }
            );
        }
    }
}
