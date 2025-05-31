using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Softy.Server.Data;
using Softy.Server.Models;
using Softy.Server.Models.DbModels;

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

        [HttpGet]
        public async Task<IActionResult> GetServices([FromQuery] int? type)
        {
            var query = _context.Services.AsQueryable();

            if (type.HasValue)
                query = query.Where(s => s.ServiceTypeId == type.Value);

            var services = await query
                .Include(s => s.ServiceType)
                .ToListAsync();

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

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteService(int id)
        {
            var service = await _context.Services.FindAsync(id);
            if (service == null)
            {
                return NotFound("Услуга не найдена.");
            }

            _context.Services.Remove(service);
            await _context.SaveChangesAsync();

            return Ok("Услуга успешно удалена.");
        }

        [HttpPut("update/{id}")]
        public async Task<IActionResult> UpdateService(int id, [FromBody] AddServiceModel request)
        {
            var service = await _context.Services.FindAsync(id);
            if (service == null)
            {
                return NotFound("Услуга не найдена.");
            }

            service.Name = request.Name;
            service.Description = request.Description;
            service.Price = request.Price;
            service.Duration = request.Duration;
            service.ServiceTypeId = request.ServiceTypeId;

            _context.Services.Update(service);
            await _context.SaveChangesAsync();

            return Ok(service);
        }
    }
}


