using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Softy.Server.Models.DbModels
{
    [Table("availabletimes")]
    public class AvailableTime
    {
        [Column("id")][Key] public int Id { get; set; }
        [Column("master_id")] public int MasterId { get; set; }
        [Column("service_id")] public int ServiceId { get; set; }
        [Column("available_date")] public DateTime AvailableDate { get; set; }
        [ForeignKey("MasterId")]
        public User User { get; set; }
        public Service Service { get; set; }
    }
}
