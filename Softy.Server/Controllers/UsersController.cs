using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Softy.Server.Data;
using Softy.Server.Models;
using Softy.Server.Models.DbModels;
using System.Security.Claims;

namespace Softy.Server.Controllers
{
    [Route("users")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsersController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("profile")]
        public async Task<IActionResult> Profile()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userId == null)
            {
                return Unauthorized("Пользователь не авторизован.");
            }

            // Получаем пользователя из базы данных по ID
            var user = await _context.Users
                                     .Include(u => u.Role)
                                     .FirstOrDefaultAsync(u => u.Id == int.Parse(userId)); 

            if (user == null)
            {
                return NotFound("Пользователь не найден.");
            }

            // Возвращаем профиль
            var profileData = new
            {
                user.Name,
                user.Surname,
                user.Phone,
                RoleId = user.RoleId,
            };

            return Ok(profileData);
        }

        [HttpGet("masters")]
        [Authorize(Roles = "master")]
        public async Task<IActionResult> GetMasters()
        {
            var masters = await _context.Users
                .Where(u => u.RoleId == 1)
                .Select(u => new {
                    u.Id,
                    u.Name,
                    u.Surname,
                    u.Phone
                })
                .ToListAsync();

            return Ok(masters);
        }

        [HttpPost("add-user")]
        [Authorize(Roles = "master")]
        public async Task<IActionResult> AddUser([FromBody] RegisterModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest("Неверные данные");

            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Phone == model.Phone);
            if (existingUser != null)
                return BadRequest("Пользователь с таким номером уже существует");

            var newUser = new User
            {
                Name = model.Name,
                Surname = model.Surname,
                Phone = model.Phone,
                RoleId = model.RoleId, 
            };

            newUser.Password = new PasswordHasher<User>().HashPassword(newUser, model.Password);

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Пользователь успешно добавлен" });
        }
    }
}

