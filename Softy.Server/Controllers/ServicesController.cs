using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Softy.Server.Data;
using Softy.Server.Models;
using Softy.Server.Models.DbModels;
using System.Security.Claims;

namespace Softy.Controllers
{
    [Route("services")]
    [ApiController]
    public class ServicesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ServicesController(AppDbContext context)
        {
            _context = context;
        }

        // Получение списка всех услуг
        [HttpGet]
        public async Task<IActionResult> GetServices([FromQuery] int? type)
        {
            var query = _context.Services.AsQueryable();

            if (type.HasValue)
                query = query.Where(s => s.ServiceTypeId == type.Value);

            // Асинхронный вызов для получения списка
            var services = await query.ToListAsync();

            return Ok(services);
        }


        [HttpPost("add-service")]
        public async Task<ActionResult<Service>> AddService([FromBody] AddServiceModel request)
        {
            if (string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(request.Description) ||
                request.Price <= 0 || string.IsNullOrWhiteSpace(request.Duration))
            {
                return BadRequest("Все поля должны быть заполнены и цена должна быть больше нуля.");
            }

            var service = new Service
            {
                Name = request.Name,
                Description = request.Description,
                Price = request.Price,
                Duration = request.Duration,
                ServiceTypeId = request.ServiceTypeId
            };

            _context.Services.Add(service);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetServices), new { id = service.Id }, service);
        }



    }
}


