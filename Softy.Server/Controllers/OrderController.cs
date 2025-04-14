using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Softy.Server.Data;
using Softy.Server.Models;
using Softy.Server.Models.DbModels;
using System.Security.Claims;

namespace Softy.Server.Controllers
{
    [Route("orders")]
    [ApiController]
    public class OrderController : ControllerBase
    {
        private readonly AppDbContext _context;

        public OrderController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("available-times")]
        public async Task<IActionResult> GetAvailableTimes([FromQuery] int serviceId)
        {
            var availableTimes = await _context.AvailableTimes
                .Include(a => a.User) 
                .Where(a => a.ServiceId == serviceId && !_context.Orders.Any(o => o.AvailableTimeId == a.Id))
                .ToListAsync();

            return Ok(availableTimes.Select(a => new
            {
                a.Id,
                a.AvailableDate,
                MasterId = a.MasterId,  
                MasterName = $"{a.User.Name} {a.User.Surname}"  
            }));
        }

        [Authorize]
        [HttpPost("create")]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderModel request)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            var order = new Order
            {
                UserId = userId,
                AvailableTimeId = request.AvailableTimeId,
                MasterId = request.MasterId,
                StatusId = 1, 
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            return Ok(order);
        }

        [HttpGet("my-available-times")]
        public async Task<IActionResult> GetMyAvailableTimes()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var times = await _context.AvailableTimes
                .Where(t => t.MasterId == userId &&
                            !_context.Orders.Any(o => o.AvailableTimeId == t.Id))
                .ToListAsync();

            return Ok(times);
        }

        [HttpPost("add-available-time")]
        public async Task<IActionResult> AddAvailableTime([FromBody] AvailableTimeModel timeRequest)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null)
                {
                    return Unauthorized("Пользователь не авторизован.");
                }

                var userId = int.Parse(userIdClaim.Value);
                var time = new AvailableTime
                {
                    MasterId = userId,
                    ServiceId = timeRequest.ServiceId,
                    AvailableDate = timeRequest.AvailableDate
                };
                if (time.ServiceId == 0)
                {
                    return BadRequest("Service field is required.");
                }
                _context.AvailableTimes.Add(time);
                await _context.SaveChangesAsync();

                return Ok(time);
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Ошибка при добавлении времени: {ex.Message}");
                return StatusCode(500, "Произошла ошибка на сервере. Пожалуйста, попробуйте позже.");
            }
        }

        [HttpDelete("remove-available-time/{id}")]
        public async Task<IActionResult> RemoveAvailableTime(int id)
        {
            var time = await _context.AvailableTimes.FindAsync(id);
            if (time == null) return NotFound();

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            if (time.MasterId != userId) return Forbid();

            _context.AvailableTimes.Remove(time);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpGet("master-orders")]
        public async Task<IActionResult> GetMasterOrders()
        {
            var masterId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var orders = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.AvailableTime)
                    .ThenInclude(at => at.Service)
                .Where(o => o.MasterId == masterId)
                .ToListAsync();

            return Ok(orders);
        }

        [HttpPut("{orderId}/status")]
        public async Task<IActionResult> UpdateOrderStatus(int orderId, [FromBody] StatusUpdateDto dto)
        {
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null) return NotFound();

            order.StatusId = dto.StatusId;
            order.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(order);
        }
        [HttpGet("my-bookings")]
        public async Task<IActionResult> GetMyBookings()
        {
            
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var bookings = await _context.Orders
                .Where(o => o.UserId == userId)  
                .Include(o => o.AvailableTime)   
                .ThenInclude(at => at.Service) 
                .ToListAsync();
            
            return Ok(bookings);
        }

        public class StatusUpdateDto
        {
            public int StatusId { get; set; }
        }
    }

    
}
