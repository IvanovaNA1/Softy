using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Softy.Server.Models.DbModels
{
    [Table("orderstatus")]
    public class OrderStatus
    {
        [Column("id")][Key] public int Id { get; set; }
        [Column("status")] public string Status { get; set; }
    }
}
