using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Softy.Server.Data;
using Softy.Server.Models;
using Softy.Server.Models.DbModels;
using System.Security.Claims;
using System.Security.Principal;

namespace Softy.Server.Controllers
{
    [Route("account")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AccountController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel loginModel)
        {
            if (ModelState.IsValid)
            {
                var user = await _context.Users
                                         .Include(u => u.Role)
                                         .FirstOrDefaultAsync(u => u.Phone == loginModel.Phone);
                if (user == null)
                {
                    return Unauthorized("Пользователь не найден.");
                }
                var passwordHasher = new PasswordHasher<User>();
                var passwordVerificationResult = passwordHasher.VerifyHashedPassword(user, user.Password, loginModel.Password);

                if (passwordVerificationResult == PasswordVerificationResult.Failed)
                {
                    return Unauthorized("Неверный пароль.");
                }

                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.Name, user.Name),
                    new Claim(ClaimTypes.Surname, user.Surname),
                    new Claim(ClaimTypes.MobilePhone, user.Phone),
                    new Claim(ClaimTypes.Role, user.Role.Name),  
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())
                };

                var claimsIdentity = new ClaimsIdentity(claims, "login");

                var claimsPrincipal = new ClaimsPrincipal(claimsIdentity);

                var authProperties = new AuthenticationProperties
                {
                    ExpiresUtc = DateTime.UtcNow.AddHours(1),  // Время жизни 
                    IsPersistent = loginModel.RememberMe  // Флаг для постоянной сессии
                };

                await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, claimsPrincipal, authProperties);

                return Ok(new { message = "Авторизация прошла успешно." });
            }

            return BadRequest("Неверные данные.");
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterModel registerModel)
        {
            if (ModelState.IsValid)
            {
                var existingUser = await _context.Users
                                                 .FirstOrDefaultAsync(u => u.Phone == registerModel.Phone);
                if (existingUser != null)
                {
                    return BadRequest("Пользователь с таким номером телефона уже существует.");
                }

                var user = new User
                {
                    Name = registerModel.Name,
                    Surname = registerModel.Surname,
                    Phone = registerModel.Phone,
                    Password = registerModel.Password,  
                    RoleId = 2  
                };

                var passwordHash = new PasswordHasher<User>().HashPassword(user, registerModel.Password);
                user.Password = passwordHash;

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.Name, user.Name),
                    new Claim(ClaimTypes.Surname, user.Surname),
                    new Claim(ClaimTypes.MobilePhone, user.Phone),
                    new Claim(ClaimTypes.Role, user.RoleId.ToString()),  
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())
                };

                var claimsIdentity = new ClaimsIdentity(claims, "login");

                var claimsPrincipal = new ClaimsPrincipal(claimsIdentity);

                var authProperties = new AuthenticationProperties
                {
                    ExpiresUtc = DateTime.UtcNow.AddHours(1),
                    IsPersistent = true  
                };

                await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, claimsPrincipal, authProperties);

                return Ok(new { message = "Регистрация прошла успешно." });
            }

            return BadRequest("Неверные данные.");
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return Ok(new { message = "Вы успешно вышли из системы." });
        }
    }
}

    



