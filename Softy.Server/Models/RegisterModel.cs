namespace Softy.Server.Models
{
    public class RegisterModel
    {
        public string Name { get; set; }
        public string Surname { get; set; }
        public string Phone { get; set; }
        public string Password { get; set; }
        public int RoleId { get; set; } = 2;
    }
}
