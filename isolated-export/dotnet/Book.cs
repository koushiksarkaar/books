using System;

namespace BookListApp.Models
{
    public class Book
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Title { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public string CoverUrl { get; set; } = string.Empty;
        public int Rating { get; set; } = 5;
        public string Language { get; set; } = "English";
        public string Genre { get; set; } = "Romance";
        public int Popularity { get; set; } = 50;
        public string Description { get; set; } = string.Empty;
        public int DownloadCount { get; set; } = 0;
    }
}
