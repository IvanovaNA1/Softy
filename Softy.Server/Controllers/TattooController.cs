using Microsoft.AspNetCore.Mvc;

namespace Softy.Server.Controllers
{
    [ApiController]
    [Route("tattoo")]
    public class TattooController : ControllerBase
    {
        [HttpPost("upload")]
        public async Task<IActionResult> Upload(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("Файл не выбран.");

            var filePath = Path.Combine("Uploads", file.FileName);

            Directory.CreateDirectory("Uploads");
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return Ok(new { url = $"/Uploads/{file.FileName}" });
        }
    }
}

