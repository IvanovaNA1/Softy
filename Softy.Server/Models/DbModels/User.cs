using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Softy.Server.Models.DbModels
{
    [Table("users")]
    public class User
    {
        [Column("id")][Key] public int Id { get; set; }
        [Column("name")] public string? Name { get; set; }
        [Column("surname")] public string? Surname { get; set; }
        [Column("phone")] public string? Phone { get; set; }
        [Column("password")] public string? Password { get; set; }
        [Column("role_id")] public int RoleId { get; set; }
        public Role? Role { get; set; }
    }
}
