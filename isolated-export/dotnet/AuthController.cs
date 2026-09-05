using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BookListApp.Data;
using BookListApp.Models;
using System;
using System.Threading.Tasks;

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

    public class SignupDto { public string Username { get; set; } = string.Empty; public string MobileNumber { get; set; } = string.Empty; }
    public class LoginDto { public string MobileNumber { get; set; } = string.Empty; }
}
