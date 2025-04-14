namespace Softy.Server.Models
{
    public class LoginModel
    {
        public string? Phone { get; set; }
        public string? Password { get; set; }
        public bool RememberMe { get; set; }
    }
}
